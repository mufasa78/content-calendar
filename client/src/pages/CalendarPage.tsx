import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useContent, useUpdateContent } from "@/hooks/use-content";
import { ContentDialog } from "@/components/ContentDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type ContentItem } from "@shared/schema";
import { SidebarNav } from "@/components/SidebarNav";

export default function CalendarPage() {
  const { data: content, isLoading } = useContent();
  const updateMutation = useUpdateContent();
  
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleEventClick = (info: any) => {
    const item = content?.find(c => c.id === parseInt(info.event.id));
    if (item) {
      setSelectedItem(item);
      setIsDialogOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedItem(null);
    setSelectedDate(selectInfo.start);
    setIsDialogOpen(true);
  };

  const handleEventDrop = (info: any) => {
    const id = parseInt(info.event.id);
    const newDate = info.event.start;
    updateMutation.mutate({ id, scheduledAt: newDate });
  };

  const events = content?.map(item => ({
    id: item.id.toString(),
    title: item.title,
    start: item.scheduledAt || undefined,
    backgroundColor: getStatusColor(item.status),
    borderColor: getStatusColor(item.status),
    className: 'text-xs font-medium px-1 py-0.5 rounded cursor-pointer',
  })) || [];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Content Calendar</h1>
            <p className="text-muted-foreground mt-1">Drag and drop to reschedule your posts.</p>
          </div>
          <Button onClick={() => { setSelectedItem(null); setSelectedDate(undefined); setIsDialogOpen(true); }} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 h-[calc(100vh-180px)]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              height="100%"
            />
          )}
        </div>

        <ContentDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedItem}
          defaultDate={selectedDate}
        />
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Published': return '#059669'; // emerald-600
    case 'Scheduled': return '#2563eb'; // blue-600
    case 'Review': return '#d97706'; // amber-600
    default: return '#475569'; // slate-600
  }
}
