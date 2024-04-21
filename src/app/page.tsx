"use client";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  Draggable,
  DropArg,
} from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Event {
  id: number;
  title: string;
  start: Date | string;
  allDay: boolean;
}
export default function Home() {
  const [events, setEvents] = useState([
    { title: "event 1", id: 1 },
    { title: "event 2", id: 2 },
    { title: "event 3", id: 3 },
    { title: "event 4", id: 4 },
  ]);
  const [allEvents, setAllEvents] = useState<Event[]>([
    {
      id: 0,
      title: "ranawaqas",
      start: new Date(),
      allDay: true,
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    id: 0,
    title: "",
    start: "",
    allDay: false,
  });

  useEffect(() => {
    let daraggableEl = document.getElementById("draggable-el");
    let draggable: Draggable;
    if (daraggableEl) {
      draggable = new Draggable(daraggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title");
          let id = eventEl.getAttribute("data-id");
          let start = eventEl.getAttribute("start");
          let className = eventEl.getAttribute("class");
          console.log("Creating event with:", { title, id, start });
          return { title, id, start,className };
        },
      });
    }

    return () => {
      draggable?.destroy();
      console.log("Destroying Draggable");
    };
  }, []);

  function handleDateClick(arg: any) {
    setNewEvent({
      ...newEvent,
      title: "",
      start: arg.dateStr,
      allDay: arg.allDay,
      id: new Date().getTime(),
    });
    setShowModal(true);
  }

  function handleDeleteModal(arg: any) {
    setShowModal(true);
    setShowDeleteModal(true);
    setIdToDelete(Number(arg.event.id));
  }

  function addEvent(data: DropArg) {
    const event = {
      ...newEvent,
      start: data.date.toISOString(),
      title: data.draggedEl.innerText,
      allDay: data.allDay,
      id: new Date().toString(),
    };
    setAllEvents([...allEvents, event]);
  }
  // function addEvent(data: DropArg) {
  //   const event = { 
  //     ...newEvent, 
  //     start: data.date.toISOString(), 
  //     title: data.draggedEl.innerText, allDay: data.allDay, id: new Date().getTime() }
  //   setAllEvents([...allEvents, event])
  // }


  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  })

  

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (newEvent) {
      const updatedEvent = { ...newEvent, title: values.title };
      setAllEvents([...allEvents, updatedEvent]);
      setShowModal(false);
    }
  }

  function handleDelete() {
    setAllEvents(allEvents.filter(event => Number(event.id) !== Number(idToDelete)))
    setShowModal(false)
    setShowDeleteModal(false)
    setIdToDelete(null)

  }


  return (
    <div className="flex">
      <div className="w-full">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={allEvents as EventSourceInput}
          nowIndicator={true}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dateClick={handleDateClick}
          drop={(args) => addEvent(args)}
          eventClick={(data) => {
            handleDeleteModal(data);
          }}
        />
      </div>
      <div id="draggable-el" className="ml-8 w-1/2 border-2 p-2 rounded mt-4">
        <h1>Drag Event</h1>
        {events.map((event) => (
          <div
            key={event.id}
            className="fc-event border-2 p-2 m-2 w-full rounded-md ml-auto text-center bg-white"
            title={event.title}
            data-id={event.id}
          >
            {event.title}
          </div>
        ))}
      </div>
      <AlertDialog open={showModal} onOpenChange={setShowModal} >
        {showDeleteModal ? <AlertDialogContent>Do you want to delete this event?
          <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button onClick={() => handleDelete()}>Delete</Button>
        </AlertDialogContent> : <AlertDialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field}/>
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </AlertDialogContent>}
      </AlertDialog>
    </div>
  );
}
