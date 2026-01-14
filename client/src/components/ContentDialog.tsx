import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContentItemSchema, type InsertContentItem, type ContentItem } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateContent, useUpdateContent, useDeleteContent } from "@/hooks/use-content";
import { CalendarIcon, Trash2, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ContentItem | null;
  defaultDate?: Date;
}

export function ContentDialog({ open, onOpenChange, initialData, defaultDate }: ContentDialogProps) {
  const { user } = useAuth();
  const createMutation = useCreateContent();
  const updateMutation = useUpdateContent();
  const deleteMutation = useDeleteContent();

  const form = useForm<InsertContentItem>({
    resolver: zodResolver(insertContentItemSchema),
    defaultValues: {
      title: "",
      brief: "",
      platform: "LinkedIn",
      status: "Draft",
      kanbanStage: "Creation",
      userId: user?.id || "",
      intelligence: {
        targetAudience: "",
        purpose: "",
        mission: "",
        vision: "",
        cta: "",
        keywords: [],
        hashtags: []
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        userId: initialData.userId, // keep owner
        scheduledAt: initialData.scheduledAt ? new Date(initialData.scheduledAt) : undefined,
      });
    } else {
      form.reset({
        title: "",
        brief: "",
        platform: "LinkedIn",
        status: "Draft",
        kanbanStage: "Creation",
        userId: user?.id || "",
        scheduledAt: defaultDate,
        intelligence: {
          targetAudience: "",
          purpose: "",
          mission: "",
          vision: "",
          cta: "",
          keywords: [],
          hashtags: []
        }
      });
    }
  }, [initialData, defaultDate, form, user?.id]);

  const onSubmit = (data: InsertContentItem) => {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate({ ...data, userId: user?.id || "" }, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const handleDelete = () => {
    if (initialData && confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(initialData.id, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {initialData ? "Edit Content" : "New Content Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basics">Basics & Schedule</TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Post Intelligence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Title</Label>
                  <Input {...form.register("title")} placeholder="e.g. 5 Tips for Better Content" />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("platform", val)} 
                    defaultValue={form.getValues("platform")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Twitter">Twitter / X</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Newsletter">Newsletter</SelectItem>
                      <SelectItem value="Blog">Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("status", val)}
                    defaultValue={form.getValues("status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Schedule Date</Label>
                  <div className="relative">
                    <Input 
                      type="datetime-local" 
                      {...form.register("scheduledAt", { valueAsDate: true })}
                      className="pl-10"
                    />
                    <CalendarIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Content Brief</Label>
                  <Textarea 
                    {...form.register("brief")} 
                    className="min-h-[100px]" 
                    placeholder="Describe the main idea..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-4">
                <p className="text-sm text-primary/80 flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Define the strategic purpose behind this content piece.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Target Audience</Label>
                  <Input {...form.register("intelligence.targetAudience")} placeholder="Who is this for?" />
                </div>
                
                <div className="space-y-2">
                  <Label>Mission / Goal</Label>
                  <Input {...form.register("intelligence.mission")} placeholder="What does this achieve?" />
                </div>

                <div className="space-y-2">
                  <Label>Core Purpose</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("intelligence.purpose", val)}
                    defaultValue={form.getValues("intelligence.purpose")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Educate">Educate</SelectItem>
                      <SelectItem value="Inspire">Inspire</SelectItem>
                      <SelectItem value="Entertain">Entertain</SelectItem>
                      <SelectItem value="Convert">Convert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Call to Action (CTA)</Label>
                  <Input {...form.register("intelligence.cta")} placeholder="Link in bio, Subscribe, etc." />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label>Vision / Background Context</Label>
                  <Textarea 
                    {...form.register("intelligence.background")} 
                    placeholder="Any relevant context or backstory..." 
                    className="h-20"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            {initialData ? (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : <div />}
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : initialData ? "Update Content" : "Create Content"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
