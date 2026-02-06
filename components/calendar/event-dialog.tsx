"use client";

import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react";
import { useForm } from "@tanstack/react-form";
import { format, isBefore } from "date-fns";
import { memo, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { CalendarEvent, EventColor } from "./types";
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/components/calendar/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

// Static data outside component
const TIME_OPTIONS = (() => {
  const options = [];
  for (let hour = StartHour; hour <= EndHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      const value = `${formattedHour}:${formattedMinute}`;
      const date = new Date(2000, 0, 1, hour, minute);
      const label = format(date, "h:mm a");
      options.push({ label, value });
    }
  }
  return options;
})();

const COLOR_OPTIONS: Array<{
  value: EventColor;
  label: string;
  bgClass: string;
  borderClass: string;
}> = [
  {
    bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
    borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
    label: "Sky",
    value: "sky",
  },
  {
    bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
    borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
    label: "Amber",
    value: "amber",
  },
  {
    bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
    borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
    label: "Violet",
    value: "violet",
  },
  {
    bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
    borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
    label: "Rose",
    value: "rose",
  },
  {
    bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
    borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
    label: "Emerald",
    value: "emerald",
  },
  {
    bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
    borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
    label: "Orange",
    value: "orange",
  },
];

interface FormValues {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  color: EventColor;
}

function formatTimeForInput(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = Math.floor(date.getMinutes() / 15) * 15;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function getDefaultValues(event: CalendarEvent | null): FormValues {
  if (event) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return {
      title: event.title || "",
      description: event.description || "",
      startDate: start,
      endDate: end,
      startTime: formatTimeForInput(start),
      endTime: formatTimeForInput(end),
      allDay: event.allDay || false,
      location: event.location || "",
      color: (event.color as EventColor) || "sky",
    };
  }
  const now = new Date();
  return {
    title: "",
    description: "",
    startDate: now,
    endDate: now,
    startTime: `${DefaultStartHour}:00`,
    endTime: `${DefaultEndHour}:00`,
    allDay: false,
    location: "",
    color: "sky",
  };
}

// Completely isolated form component with Tanstack Form
const EventDialogForm = memo(function EventDialogForm({
  event,
  onSave,
  onDelete,
  onClose,
}: {
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const form = useForm({
    defaultValues: getDefaultValues(event),
    onSubmit: async ({ value }) => {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);

      if (!value.allDay) {
        const [startHours = 0, startMinutes = 0] = value.startTime.split(":").map(Number);
        const [endHours = 0, endMinutes = 0] = value.endTime.split(":").map(Number);

        if (
          startHours < StartHour ||
          startHours > EndHour ||
          endHours < StartHour ||
          endHours > EndHour
        ) {
          setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`);
          return;
        }

        start.setHours(startHours, startMinutes, 0);
        end.setHours(endHours, endMinutes, 0);
      } else {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      if (isBefore(end, start)) {
        setError("End date cannot be before start date");
        return;
      }

      const eventTitle = value.title.trim() ? value.title : "(no title)";

      onSave({
        allDay: value.allDay,
        color: value.color,
        description: value.description,
        end,
        id: event?.id || "",
        location: value.location,
        start,
        title: eventTitle,
      });
    },
  });

  // Reset form when event changes
  useEffect(() => {
    form.reset(getDefaultValues(event));
    setError(null);
  }, [event, form]);

  const handleDelete = useCallback(() => {
    if (event?.id) {
      onDelete(event.id);
    }
  }, [event?.id, onDelete]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogDescription className="sr-only">
          {event?.id
            ? "Edit the details of this event"
            : "Add a new event to your calendar"}
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="rounded-md bg-destructive/15 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 py-4">
        {/* Title */}
        <form.Field name="title">
          {(field) => (
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {/* Start Date & Time */}
        <div className="flex gap-4">
          <form.Field name="startDate">
            {(field) => (
              <div className="flex-1 *:not-first:mt-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
                        !field.state.value && "text-muted-foreground",
                      )}
                      id="start-date"
                      variant="outline"
                      type="button"
                    >
                      <span className={cn("truncate", !field.state.value && "text-muted-foreground")}>
                        {field.state.value ? format(field.state.value, "PPP") : "Pick a date"}
                      </span>
                      <RiCalendarLine
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground/80"
                        size={16}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-2">
                    <Calendar
                      defaultMonth={field.state.value}
                      mode="single"
                      selected={field.state.value}
                      onSelect={(date) => {
                        if (date) {
                          field.handleChange(date);
                          // Also update endDate if it's before the new startDate
                          const endDate = form.getFieldValue("endDate");
                          if (isBefore(endDate, date)) {
                            form.setFieldValue("endDate", date);
                          }
                          setError(null);
                          setStartDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.allDay}>
            {(allDay) =>
              !allDay && (
                <form.Field name="startTime">
                  {(field) => (
                    <div className="min-w-28 *:not-first:mt-1.5">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Select value={field.state.value} onValueChange={field.handleChange}>
                        <SelectTrigger id="start-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>
        </div>

        {/* End Date & Time */}
        <div className="flex gap-4">
          <form.Field name="endDate">
            {(field) => (
              <div className="flex-1 *:not-first:mt-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "group w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
                        !field.state.value && "text-muted-foreground",
                      )}
                      id="end-date"
                      variant="outline"
                      type="button"
                    >
                      <span className={cn("truncate", !field.state.value && "text-muted-foreground")}>
                        {field.state.value ? format(field.state.value, "PPP") : "Pick a date"}
                      </span>
                      <RiCalendarLine
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground/80"
                        size={16}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-2">
                    <form.Subscribe selector={(state) => state.values.startDate}>
                      {(startDate) => (
                        <Calendar
                          defaultMonth={field.state.value}
                          disabled={{ before: startDate }}
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => {
                            if (date) {
                              field.handleChange(date);
                              setError(null);
                              setEndDateOpen(false);
                            }
                          }}
                        />
                      )}
                    </form.Subscribe>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.allDay}>
            {(allDay) =>
              !allDay && (
                <form.Field name="endTime">
                  {(field) => (
                    <div className="min-w-28 *:not-first:mt-1.5">
                      <Label htmlFor="end-time">End Time</Label>
                      <Select value={field.state.value} onValueChange={field.handleChange}>
                        <SelectTrigger id="end-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>
        </div>

        {/* All Day */}
        <form.Field name="allDay">
          {(field) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="all-day"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <Label htmlFor="all-day">All day</Label>
            </div>
          )}
        </form.Field>

        {/* Location */}
        <form.Field name="location">
          {(field) => (
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        {/* Color */}
        <form.Field name="color">
          {(field) => (
            <fieldset className="space-y-4">
              <legend className="font-medium text-foreground text-sm leading-none">
                Etiquette
              </legend>
              <RadioGroup
                className="flex gap-1.5"
                value={field.state.value}
                onValueChange={(value: EventColor) => field.handleChange(value)}
              >
                {COLOR_OPTIONS.map((colorOption) => (
                  <RadioGroupItem
                    aria-label={colorOption.label}
                    className={cn(
                      "size-6 shadow-none",
                      colorOption.bgClass,
                      colorOption.borderClass,
                    )}
                    id={`color-${colorOption.value}`}
                    key={colorOption.value}
                    value={colorOption.value}
                  />
                ))}
              </RadioGroup>
            </fieldset>
          )}
        </form.Field>
      </div>

      <DialogFooter className="flex-row sm:justify-between">
        {event?.id && (
          <Button
            aria-label="Delete event"
            onClick={handleDelete}
            size="icon"
            variant="outline"
            type="button"
          >
            <RiDeleteBinLine aria-hidden="true" size={16} />
          </Button>
        )}
        <div className="flex flex-1 justify-end gap-2">
          <Button onClick={onClose} variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </DialogFooter>
    </form>
  );
});

// Main dialog component - renders via portal to avoid re-render propagation
export const EventDialog = memo(function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose]
  );

  // Render dialog via portal to completely isolate from parent tree
  if (!mounted) return null;

  return createPortal(
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {isOpen && (
          <EventDialogForm
            event={event}
            onSave={onSave}
            onDelete={onDelete}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>,
    document.body
  );
});
