import { useState, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function FilterPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <><div className="hidden md:block">{children}</div><div className="md:hidden"><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="lg"><SlidersHorizontal />Filter destinations</Button></DialogTrigger><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg"><DialogTitle>Find your destination</DialogTitle><DialogDescription>Choose a region, season or name.</DialogDescription>{children}<Button variant="secondary" size="lg" onClick={() => setOpen(false)}>Done</Button></DialogContent></Dialog></div></>;
}