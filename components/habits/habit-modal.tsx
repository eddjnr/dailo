'use client'

import { useForm } from '@tanstack/react-form'
import { memo, useEffect } from 'react'
import {
  Droplets,
  Moon,
  Dumbbell,
  BookOpen,
  Heart,
  Flame,
  Coffee,
  Footprints,
  Pill,
  Bike,
  Minus,
  Plus,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Habit, HabitType } from '@/lib/types'

const habitIcons = [
  { id: 'droplets', icon: Droplets, label: 'Water' },
  { id: 'moon', icon: Moon, label: 'Sleep' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Exercise' },
  { id: 'book', icon: BookOpen, label: 'Read' },
  { id: 'heart', icon: Heart, label: 'Health' },
  { id: 'flame', icon: Flame, label: 'Streak' },
  { id: 'coffee', icon: Coffee, label: 'Coffee' },
  { id: 'footprints', icon: Footprints, label: 'Walk' },
  { id: 'pill', icon: Pill, label: 'Medicine' },
  { id: 'bike', icon: Bike, label: 'Cycling' },
]

interface HabitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit | null
}

interface FormValues {
  name: string
  icon: string
  type: HabitType
  target: number
  unit: string
}

function getDefaultValues(habit: Habit | null | undefined): FormValues {
  if (habit) {
    return {
      name: habit.name,
      icon: habit.icon,
      type: habit.type,
      target: habit.target,
      unit: habit.unit || '',
    }
  }
  return {
    name: '',
    icon: 'droplets',
    type: 'binary',
    target: 1,
    unit: '',
  }
}

const HabitModalForm = memo(function HabitModalForm({
  habit,
  onClose,
}: {
  habit: Habit | null | undefined
  onClose: () => void
}) {
  const addHabit = useAppStore((state) => state.addHabit)
  const updateHabit = useAppStore((state) => state.updateHabit)

  const isEditing = !!habit

  const form = useForm({
    defaultValues: getDefaultValues(habit),
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) return

      const habitData = {
        name: value.name.trim(),
        icon: value.icon,
        type: value.type,
        target: value.type === 'binary' ? 1 : value.target,
        unit: value.type === 'count' ? value.unit || undefined : undefined,
      }

      if (isEditing && habit) {
        updateHabit(habit.id, habitData)
      } else {
        addHabit(habitData)
      }

      onClose()
    },
  })

  useEffect(() => {
    form.reset(getDefaultValues(habit))
  }, [habit, form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update your habit details' : 'Add a new habit to track daily'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Habit Name */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="e.g., Drink water, Exercise, Read..."
                autoFocus
              />
            </div>
          )}
        </form.Field>

        {/* Habit Type Selection */}
        <form.Field name="type">
          {(field) => (
            <div className="space-y-3">
              <Label>Type</Label>
              <RadioGroup
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as HabitType)}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  htmlFor="binary"
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    field.state.value === 'binary'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="binary" id="binary" />
                  <div>
                    <div className="font-medium text-sm">Simple</div>
                    <div className="text-xs text-muted-foreground">Done / Not done</div>
                  </div>
                </label>
                <label
                  htmlFor="count"
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    field.state.value === 'count'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="count" id="count" />
                  <div>
                    <div className="font-medium text-sm">Count</div>
                    <div className="text-xs text-muted-foreground">Track daily target</div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}
        </form.Field>

        {/* Count-based fields */}
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) =>
            type === 'count' && (
              <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <form.Field name="target">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="target">Daily Target</Label>
                        <div className="flex items-center border border-input rounded-4xl overflow-hidden">
                          <Input
                            id="target"
                            type="number"
                            min={1}
                            max={1000}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                            onBlur={field.handleBlur}
                            className="border-0 rounded-r-none text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => field.handleChange(Math.max(1, field.state.value - 1))}
                            disabled={field.state.value <= 1}
                            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-l border-input"
                          >
                            <Minus className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => field.handleChange(Math.min(1000, field.state.value + 1))}
                            disabled={field.state.value >= 1000}
                            className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-l border-input"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="unit">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit (optional)</Label>
                        <Input
                          id="unit"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="glasses, pages..."
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: Drink 8 glasses of water per day
                </p>
              </div>
            )
          }
        </form.Subscribe>

        {/* Icon Selection */}
        <form.Field name="icon">
          {(field) => (
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {habitIcons.map((h) => {
                  const IconComp = h.icon
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => field.handleChange(h.id)}
                      title={h.label}
                      className={cn(
                        'size-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95',
                        field.state.value === h.id
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'border-2 border-muted hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <IconComp className="size-5" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </form.Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <form.Subscribe selector={(state) => state.values.name}>
          {(name) => (
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? 'Save Changes' : 'Create Habit'}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
})

export function HabitModal({ open, onOpenChange, habit }: HabitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <HabitModalForm
            habit={habit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
