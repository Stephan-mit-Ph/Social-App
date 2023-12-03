import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Button, Input, Textarea } from '@/components/ui';
import { FileUploader, Loader } from '@/components/shared';
import { PostValidation } from '@/lib/validation';
import { Models } from 'appwrite';
import { useCreatePost, useUpdatePost } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

type PostFormProps = {
	post?: Models.Document;
	action: 'Create' | 'Update';
};

const PostForm = ({ post, action }: PostFormProps) => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { user } = useUserContext();
	const form = useForm<z.infer<typeof PostValidation>>({
		resolver: zodResolver(PostValidation),
		defaultValues: {
			caption: post ? post?.caption : '',
			file: [],
			location: post ? post.location : '',
			tags: post ? post.tags.join(',') : '',
		},
	});

	// Query
	const { mutateAsync: createPost, isLoading: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } =
    useUpdatePost();

	// Handler
	async function onSubmit(value: z.infer<typeof PostValidation>) {
		const newPost = await createPost({
			...value,
			userId: user.id,
		});

		if (!newPost) {
			toast({
				title: `${action} post failed. Please try again.`,
			});
		}
		navigate('/');
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-9 w-full  max-w-5xl'
			>
				<FormField
					control={form.control}
					name='caption'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='shad-form_label'>Caption</FormLabel>
							<FormControl>
								<Textarea
									className='shad-textarea custom-scrollbar'
									{...field}
								/>
							</FormControl>
							<FormMessage className='shad-form_message' />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='file'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='shad-form_label'>Add Photos</FormLabel>
							<FormControl>
								<FileUploader
									fieldChange={field.onChange}
									mediaUrl={post?.imageUrl}
								/>
							</FormControl>
							<FormMessage className='shad-form_message' />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='location'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='shad-form_label'>Add Location</FormLabel>
							<FormControl>
								<Input
									type='text'
									className='shad-input'
									{...field}
								/>
							</FormControl>
							<FormMessage className='shad-form_message' />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='tags'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='shad-form_label'>Add Tags (separated by comma " , ")</FormLabel>
							<FormControl>
								<Input
									placeholder='Art, Expression, Learn'
									type='text'
									className='shad-input'
									{...field}
								/>
							</FormControl>
							<FormMessage className='shad-form_message' />
						</FormItem>
					)}
				/>

				<div className='flex gap-4 items-center justify-end'>
					<Button
						type='button'
						className='shad-button_dark_4'
						onClick={() => navigate(-1)}
					>
						Cancel
					</Button>
					<Button
						type='submit'
						className='shad-button_primary whitespace-nowrap'
						disabled={isLoadingCreate || isLoadingUpdate}
					>
						{(isLoadingCreate || isLoadingUpdate) && <Loader />}
						{action} Post
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default PostForm;
