'use client'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const schema = z.object({
  question: z.string().min(3, 'Min 3 characters'),
  options: z.array(z.object({ text: z.string().min(1, 'Required') })).min(2).max(10),
  allowMultiple: z.boolean().default(false),
  closesAt: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = { eventId: string; onCreated: () => void }

export function PollCreator({ eventId, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { question: '', options: [{ text: '' }, { text: '' }], allowMultiple: false },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: data.question,
          options: data.options.map(o => o.text.trim()),
          allowMultiple: data.allowMultiple,
          closesAt: data.closesAt || null,
          isLive: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success('Poll created!')
      reset({ question: '', options: [{ text: '' }, { text: '' }], allowMultiple: false })
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create New Poll</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Question</Label>
            <Input {...register('question')} placeholder="What would you like to ask?" className="mt-1" />
            {errors.question && <p className="text-xs text-destructive mt-1">{errors.question.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => fields.length < 10 && append({ text: '' })} disabled={fields.length >= 10}>
                <Plus className="mr-1 h-3.5 w-3.5" />Add
              </Button>
            </div>
            <AnimatePresence>
              {fields.map((field, idx) => (
                <motion.div key={field.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6 shrink-0">{idx + 1}.</span>
                  <Input {...register(`options.${idx}.text`)} placeholder={`Option ${idx + 1}`} className="flex-1" />
                  {fields.length > 2 && (
                    <Button type="button" size="icon" variant="ghost" className="shrink-0 h-8 w-8" onClick={() => remove(idx)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {errors.options && <p className="text-xs text-destructive mt-1">{errors.options.message}</p>}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="am" {...register('allowMultiple')} className="rounded border-gray-300" />
            <Label htmlFor="am" className="text-sm">Allow multiple selections</Label>
          </div>
          <div>
            <Label>Auto-close at (optional)</Label>
            <Input type="datetime-local" {...register('closesAt')} className="mt-1" />
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
