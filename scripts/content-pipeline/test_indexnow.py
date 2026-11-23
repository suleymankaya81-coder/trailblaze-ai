import os, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(__file__))
import indexnow  # noqa: E402

KEY = "e30e5c8f5cb37300c499a62294390bb2"


class Resp:
    def __init__(self, status=200, content=b""):
        self.status_code, self.content = status, content


class IndexNowTest(unittest.TestCase):
    def test_uses_the_existing_key_file(self):
        self.assertEqual(indexnow.find_key(), KEY)

    def test_ignores_txt_files_that_are_not_key_files(self):
        with tempfile.TemporaryDirectory() as d:
            open(os.path.join(d, "llms.txt"), "w").write("hello")
            open(os.path.join(d, "abcdef0123456789.txt"), "w").write("something else")
            with self.assertRaises(FileNotFoundError):
                indexnow.find_key(d)

    def test_only_own_https_host_and_no_duplicates(self):
        urls = ["https://wildparkroutes.com/a", "https://wildparkroutes.com/a", "http://wildparkroutes.com/b",
                "https://www.wildparkroutes.com/c", "https://minialife.com/d", "", None]
        self.assertEqual(indexnow.site_urls(urls), ["https://wildparkroutes.com/a"])

    def test_batches_never_exceed_10000(self):
        urls = [f"https://wildparkroutes.com/p{i}" for i in range(25_001)]
        sizes = [len(b) for b in indexnow.batches(urls, size=50_000)]
        self.assertEqual(sizes, [10_000, 10_000, 5_001])
        self.assertEqual([len(p["urlList"]) for p in indexnow.payloads(urls, key=KEY)], [10_000, 10_000, 5_001])

    def test_payload_points_to_the_key_file(self):
        p = indexnow.payloads(["https://wildparkroutes.com/destinations/us/utah/zion"], key=KEY)[0]
        self.assertEqual(p, {"host": "wildparkroutes.com", "key": KEY, "keyLocation": f"https://wildparkroutes.com/{KEY}.txt",
                             "urlList": ["https://wildparkroutes.com/destinations/us/utah/zion"]})

    def test_notify_posts_and_never_raises(self):
        sent = []
        def post(url, json, headers, timeout):
            sent.append((url, json["urlList"]))
            return Resp(202)
        self.assertEqual(indexnow.notify(["https://wildparkroutes.com/x"], post=post), [(1, 202)])
        self.assertEqual(sent, [("https://api.indexnow.org/indexnow", ["https://wildparkroutes.com/x"])])
        def broken(*a, **k):
            raise ConnectionError("offline")
        self.assertEqual(indexnow.notify(["https://wildparkroutes.com/x"], post=broken), [])

    def test_notify_can_be_disabled_and_skips_empty_lists(self):
        def post(*a, **k):
            raise AssertionError("must not post")
        self.assertEqual(indexnow.notify([], post=post), [])
        os.environ["INDEXNOW_DISABLED"] = "1"
        try:
            self.assertEqual(indexnow.notify(["https://wildparkroutes.com/x"], post=post), [])
        finally:
            del os.environ["INDEXNOW_DISABLED"]

    def test_destination_urls_match_the_site_paths(self):
        self.assertEqual(indexnow.destination_url("us", "utah", "zion"), "https://wildparkroutes.com/destinations/us/utah/zion")
        self.assertEqual(indexnow.destination_url("us", "utah", "zion", "de"), "https://wildparkroutes.com/de/destinations/us/utah/zion")

    def test_sitemap_index_is_expanded(self):
        index = b'<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://wildparkroutes.com/sitemaps/pages.xml</loc></sitemap></sitemapindex>'
        child = b'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://wildparkroutes.com/</loc></url><url><loc>https://wildparkroutes.com/about</loc></url></urlset>'
        pages = {"https://wildparkroutes.com/sitemap.xml": index, "https://wildparkroutes.com/sitemaps/pages.xml": child}
        self.assertEqual(indexnow.sitemap_urls("https://wildparkroutes.com/sitemap.xml", get=lambda u, timeout: Resp(content=pages[u])),
                         ["https://wildparkroutes.com/", "https://wildparkroutes.com/about"])

    def test_cli_is_a_dry_run_without_submit(self):
        called = []
        orig = indexnow.requests.post
        indexnow.requests.post = lambda *a, **k: called.append(1)
        try:
            self.assertEqual(indexnow.main(["--urls", "https://wildparkroutes.com/a"]), 0)
        finally:
            indexnow.requests.post = orig
        self.assertEqual(called, [])


if __name__ == "__main__":
    unittest.main()
