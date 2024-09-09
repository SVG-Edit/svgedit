/*"use client";import React, { useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Control } from 'react-hook-form'; // Import Control from react-hook-form
import { Pencil } from 'lucide-react';

import { 
  Form,
  FormField,
  FormControl, 
  FormItem, 
  FormMessage } from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import toast from 'react-hot-toast';
import axios from 'axios';
import {useRouter} from "next/navigation"

interface TitleFormProps {
  initialData: {
    title: string;
  };
  //onSaveTitle: (newTitle: string) => void;
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Course Deck Title is required.' }),
});

export const TitleForm: React.FC<TitleFormProps> = ({ initialData, onSaveTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { handleSubmit, control, formState } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  const { isSubmitting, isValid } = formState;

  const toggleEdit = () => {
    setIsEditing((current) => !current);
  };

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('Successfully updated course deck title');
      toggleEdit();
      router.refresh();

    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    onSaveTitle(values.title);
    toggleEdit();
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Deck Title
        <Button onClick={toggleEdit} >
          {isEditing ? 'Cancel' : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Deck Title
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p className="text-sm mt-2">{initialData.title}</p>
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            name="title"
            control={formSchema.control} // Use Control from react-hook-form
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Lifecycle of a Jellyfish" {...field} />
                </FormControl> */

{
  /* Ensure FormMessage has children prop */
} /*
                <FormMessage children={undefined} />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-x-2">
          <Button disabled={!isValid || isSubmitting} type="submit">
            Save
          </Button>
          </div>
        </Form>
      )}
    </div>
  );
};


*/
