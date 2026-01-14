import { useState } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContent, useUpdateContent } from "@/hooks/use-content";
import { ContentDialog } from "@/components/ContentDialog";
import { SidebarNav } from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Twitter, Linkedin, Mail, FileText } from "lucide-react";
import { type ContentItem } from "@shared/schema";
import { cn } from "@/lib/utils";

const COLUMNS = ["Creation", "Curation", "Conversation"] as const;

export default function KanbanPage() {
  const { data: content, isLoading } = useContent();
  const updateMutation = useUpdateContent();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = content?.find(c => c.id === active.id);
    const overId = over.id;
    
    // Determine target column
    let newStage = overId;
    // If dropped over an item, find that item's column
    if (typeof overId === 'number') {
      const overItem = content?.find(c => c.id === overId);
      if (overItem) newStage = overItem.kanbanStage;
    }

    if (activeItem && activeItem.kanbanStage !== newStage && COLUMNS.includes(newStage)) {
      updateMutation.mutate({ id: activeItem.id, kanbanStage: newStage });
    }
  };

  const openEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 ml-64 p-8 overflow-hidden h-screen flex flex-col">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Weekly Focus</h1>
            <p className="text-muted-foreground mt-1">Move your ideas from conception to conversation.</p>
          </div>
          <Button onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </div>

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden pb-4">
            {COLUMNS.map(columnId => (
              <Column 
                key={columnId} 
                id={columnId} 
                title={columnId} 
                items={content?.filter(c => c.kanbanStage === columnId) || []}
                onItemClick={openEdit}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeId ? (
              <Card item={content?.find(c => c.id === activeId)!} />
            ) : null}
          </DragOverlay>
        </DndContext>

        <ContentDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedItem}
        />
      </div>
    </div>
  );
}

function Column({ id, title, items, onItemClick }: { id: string, title: string, items: ContentItem[], onItemClick: (item: ContentItem) => void }) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full bg-muted/40 rounded-xl border border-border/50">
      <div className="p-4 border-b border-border/50 bg-white/50 backdrop-blur-sm rounded-t-xl sticky top-0 z-10 flex items-center justify-between">
        <h3 className="font-bold text-foreground font-display">{title}</h3>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableItem key={item.id} item={item} onClick={() => onItemClick(item)} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="h-32 flex items-center justify-center text-muted-foreground/40 border-2 border-dashed border-muted-foreground/10 rounded-lg text-sm">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

function SortableItem({ item, onClick }: { item: ContentItem, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card item={item} onClick={onClick} />
    </div>
  );
}

function Card({ item, onClick }: { item: ContentItem, onClick?: () => void }) {
  const PlatformIcon = getPlatformIcon(item.platform);

  return (
    <div 
      onClick={onClick}
      className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative"
    >
      <div className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
          <PlatformIcon className="w-3.5 h-3.5" />
        </div>
        <span className={cn(
          "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
          item.status === 'Published' ? "bg-emerald-100 text-emerald-700" :
          item.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
          item.status === 'Review' ? "bg-amber-100 text-amber-700" :
          "bg-slate-100 text-slate-600"
        )}>
          {item.status}
        </span>
      </div>
      
      <h4 className="font-semibold text-foreground line-clamp-2 mb-2 pr-4">{item.title}</h4>
      
      {item.intelligence?.mission && (
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{item.intelligence.mission}"
        </p>
      )}
    </div>
  );
}

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'twitter': return Twitter;
    case 'linkedin': return Linkedin;
    case 'newsletter': return Mail;
    default: return FileText;
  }
}
