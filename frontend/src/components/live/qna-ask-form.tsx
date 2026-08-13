'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const schema = z.object({ text: z.string().min(10, 'Min 10 characters').max(500, 'Max 500 characters') })
type FormValues = z.infer<typeof schema>

type Props = { eventId: string; onSubmitted: () => void }

export function QnAAskForm({ eventId, onSubmitted }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: { text: '' },
  })
  const textVal = watch('text') || ''

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/qna`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success('Question submitted for review')
      reset()
      onSubmitted()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Ask a Question</Label>
            <Textarea {...register('text')} placeholder="Type your question here..." rows={3} className="mt-1 resize-none" />
            <div className="flex items-center justify-between mt-1">
              {errors.text ? <p className="text-xs text-destructive">{errors.text.message}</p> : <span />}
              <span className="text-xs text-muted-foreground">{textVal.length}/500</span>
            </div>
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />Submit Question
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
