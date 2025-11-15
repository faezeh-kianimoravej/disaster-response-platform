import { useEffect, useMemo, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormShell from '@/components/forms/base/FormShell';
import RHFInput from '@/components/forms/rhf/RHFInput';
import RHFImageInput from '@/components/forms/rhf/RHFImageInput';
import { resourceRequestSchema, type ResourceRequestValues } from '@/validation/resourceValidation';
import { createOptionsFromObject } from '@/components/forms/base/FormInput';
import { RESOURCE_TYPE_IMAGES, getImageForResourceType } from '@/utils/resourceUtils';
import { RESOURCE_TYPES, RESOURCE_CATEGORIES, RESOURCE_KINDS } from '@/types/resource';
import type { Resource, ResourceFormData } from '@/types/resource';
import { useToast } from '@/components/toast/ToastProvider';
import { useCreateResource, useUpdateResource } from '@/hooks/useResource';
import { routes } from '@/routes';
import { RESOURCE_TYPE_CATEGORY } from '@/types/resource';

type ResourceFormProps = {
	initialData?: Partial<Resource>;
	isNewResource: boolean;
	departmentId: number;
	onCancel: () => void;
	onImageChange?: (src: string) => void;
	onSaved?: () => void;
};

export default function ResourceForm({
	initialData,
	isNewResource,
	departmentId,
	onCancel,
	onImageChange,
	onSaved,
}: ResourceFormProps) {
	const [useDefaultImage, setUseDefaultImage] = useState(() => {
		if (!initialData?.image) return true;
		const defaultImages = Object.values(RESOURCE_TYPE_IMAGES);
		return defaultImages.includes(initialData.image);
	});

	const defaultValues: ResourceRequestValues = useMemo(
		() => ({
			name: initialData?.name ?? '',
			description: initialData?.description ?? null,
			category: initialData?.category ?? RESOURCE_CATEGORIES[0],
			resourceType: initialData?.resourceType ?? RESOURCE_TYPES[0],
			resourceKind: initialData?.resourceKind ?? RESOURCE_KINDS[0],
			departmentId: initialData?.departmentId ?? departmentId ?? -1,
			totalQuantity: initialData?.totalQuantity ?? null,
			availableQuantity: initialData?.availableQuantity ?? null,
			unit: initialData?.unit ?? null,
			isTrackable: initialData?.isTrackable ?? false,
			image:
				initialData?.image ??
				getImageForResourceType(initialData?.resourceType ?? RESOURCE_TYPES[0]),
			latitude: initialData?.latitude ?? null,
			longitude: initialData?.longitude ?? null,
		}),
		[initialData, departmentId]
	);

	const methods = useForm<ResourceRequestValues>({
		resolver: zodResolver(resourceRequestSchema),
		defaultValues,
		mode: 'onSubmit',
	});

	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const createMutation = useCreateResource(departmentId);
	const updateMutation = useUpdateResource(departmentId);

	useEffect(() => {
		methods.reset(defaultValues);
	}, [defaultValues, methods]);

	useEffect(() => {
		if (onImageChange) onImageChange(defaultValues.image ?? '');
	}, [defaultValues.image, onImageChange]);

	useEffect(() => {
		const subscription = methods.watch((value, { name }) => {
			if (name !== 'resourceType') return;
			if (!useDefaultImage) return;

			const selectedType = (value.resourceType as string) ?? RESOURCE_TYPES[0];
			const defaultForType = getImageForResourceType(selectedType);
			const currentImage = value.image as string | undefined;

			if (currentImage !== defaultForType) {
				methods.setValue('image', defaultForType, { shouldValidate: true, shouldDirty: true });
				onImageChange?.(defaultForType);
			}
		});
		return () => subscription.unsubscribe();
	}, [methods, onImageChange, useDefaultImage]);

	useEffect(() => {
		const subscription = methods.watch((value, { name }) => {
			if (name !== 'image') return;

			const currentImage = value.image as string | undefined;
			if (!currentImage) return;

			const defaultImages = Object.values(RESOURCE_TYPE_IMAGES);
			const isCustomImage = !defaultImages.includes(currentImage);

			if (isCustomImage && useDefaultImage) {
				setUseDefaultImage(false);
			}
		});
		return () => subscription.unsubscribe();
	}, [methods, useDefaultImage]);

	function isDataUrl(s: string | undefined): boolean {
		return typeof s === 'string' && s.startsWith('data:');
	}

	async function toDataUrlIfDefault(urlOrData: string): Promise<string> {
		const defaultImages = Object.values(RESOURCE_TYPE_IMAGES);
		if (isDataUrl(urlOrData) || !defaultImages.includes(urlOrData)) {
			return urlOrData;
		}

		try {
			const resp = await fetch(urlOrData);
			const blob = await resp.blob();
			return await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result as string);
				reader.onerror = () => reject(new Error('Failed to read default image'));
				reader.readAsDataURL(blob);
			});
		} catch {
			return urlOrData;
		}
	}

	function handleImageSourceChange(source: 'default' | 'custom') {
		const isDefault = source === 'default';
		setUseDefaultImage(isDefault);

		if (isDefault) {
			const currentType = methods.getValues('resourceType') ?? 'FIELD_OPERATOR';
			const defaultImage = getImageForResourceType(currentType);
			methods.setValue('image', defaultImage, { shouldValidate: true, shouldDirty: true });
			onImageChange?.(defaultImage);
		}
	}

	async function handleSubmit(values: ResourceRequestValues) {
		try {
			const imageDataUrl = await toDataUrlIfDefault(values.image ?? '');
			const payload: ResourceFormData = {
				name: values.name ?? '',
				description: values.description !== undefined ? values.description : null,
				category: values.category ?? RESOURCE_CATEGORIES[0],
				resourceType: values.resourceType ?? RESOURCE_TYPES[0],
				resourceKind: values.resourceKind ?? RESOURCE_KINDS[0],
				departmentId: values.departmentId ?? departmentId ?? -1,
				isTrackable: values.isTrackable ?? false,
				image: imageDataUrl || '',
				...(values.totalQuantity !== undefined && { totalQuantity: values.totalQuantity }),
				...(values.availableQuantity !== undefined && {
					availableQuantity: values.availableQuantity,
				}),
				...(values.resourceKind === 'UNIQUE'
					? { unit: null }
					: values.unit !== undefined && values.unit !== null
						? { unit: values.unit }
						: {}),
				...(values.isTrackable
					? values.latitude !== undefined && values.latitude !== null
						? { latitude: values.latitude }
						: {}
					: { latitude: null }),
				...(values.isTrackable
					? values.longitude !== undefined && values.longitude !== null
						? { longitude: values.longitude }
						: {}
					: { longitude: null }),
			};

			if (isNewResource) {
				const created = await createMutation.mutateAsync(payload);
				showSuccess(`Resource "${created.name}" has been created successfully!`);
				navigate(routes.resources(departmentId));
			} else if (initialData && (initialData.resourceId ?? null) !== null) {
				const id = initialData.resourceId as number;
				const updated = await updateMutation.mutateAsync({ id, data: payload });
				showSuccess(`Resource "${updated.name}" has been updated successfully!`);
				onSaved?.();
			}
		} catch (err: unknown) {
			const e = err as Error & { validationErrors?: Record<string, string> };
			if (e.validationErrors) {
				Object.entries(e.validationErrors).forEach(([k, v]) =>
					methods.setError(k as FieldPath<ResourceRequestValues>, { type: 'server', message: v })
				);
				return;
			}
			showError(e?.message ?? 'Failed to save resource');
		}
	}

	// Get current values for conditional rendering
	const category = methods.watch('category');
	const resourceKind = methods.watch('resourceKind');
	const isTrackable = methods.watch('isTrackable');

	useEffect(() => {
		if (resourceKind === 'UNIQUE') {
			methods.setValue('unit', null, { shouldValidate: true, shouldDirty: true });
		}
	}, [resourceKind, methods]);

	useEffect(() => {
		if (!isTrackable) {
			methods.setValue('latitude', null, { shouldValidate: true, shouldDirty: true });
			methods.setValue('longitude', null, { shouldValidate: true, shouldDirty: true });
		}
	}, [isTrackable, methods]);

	// Filter resource types by selected category
	const filteredResourceTypes = RESOURCE_TYPES.filter(t => RESOURCE_TYPE_CATEGORY[t] === category);

	return (
		<FormShell methods={methods} onSubmit={handleSubmit} footer={{ onCancel }}>
			<div>
				<h2 className="text-2xl font-semibold mb-4">
					{isNewResource ? 'Create New Resource' : 'Edit Resource'}
				</h2>

				<div className="space-y-3">
					<RHFInput name="name" label="Name" required />
					<RHFInput name="description" label="Description" type="textarea" />

					<div className="grid grid-cols-2 gap-3">
						<RHFInput
							name="category"
							label="Category"
							type="select"
							options={createOptionsFromObject({
								VEHICLE: 'VEHICLE',
								EQUIPMENT: 'EQUIPMENT',
								CONSUMABLE: 'CONSUMABLE',
							})}
						/>
						<RHFInput
							name="resourceType"
							label="Resource Type"
							type="select"
							options={createOptionsFromObject(
								Object.fromEntries(filteredResourceTypes.map(t => [t, t]))
							)}
						/>
						<RHFInput
							name="resourceKind"
							label="Kind"
							type="select"
							options={createOptionsFromObject({
								UNIQUE: 'UNIQUE',
								STACKABLE: 'STACKABLE',
								CONSUMABLE: 'CONSUMABLE',
							})}
						/>
						{/* Only show unit if not UNIQUE */}
						{resourceKind !== 'UNIQUE' && (
							<RHFInput
								name="unit"
								label="Unit"
								type="select"
								options={createOptionsFromObject({
									PIECES: 'PIECES',
									LITERS: 'LITERS',
									SETS: 'SETS',
									UNITS: 'UNITS',
								})}
							/>
						)}
						{/* Use a dedicated checkbox for isTrackable */}
						<div className="flex items-center gap-2">
							<input type="checkbox" id="isTrackable" {...methods.register('isTrackable')} />
							<label htmlFor="isTrackable" className="text-sm text-gray-700">
								Trackable?
							</label>
						</div>
					</div>

					{/* Only show location if trackable */}
					{isTrackable && (
						<div className="grid grid-cols-2 gap-3">
							<RHFInput name="latitude" label="Latitude" type="number" placeholder="-90 to 90" />
							<RHFInput
								name="longitude"
								label="Longitude"
								type="number"
								placeholder="-180 to 180"
							/>
						</div>
					)}

					{/* Only show quantity fields if not UNIQUE */}
					{resourceKind !== 'UNIQUE' && (
						<div className="grid grid-cols-2 gap-3">
							<RHFInput name="totalQuantity" label="Total Quantity" type="number" />
							<RHFInput name="availableQuantity" label="Available Quantity" type="number" />
						</div>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">Image Source</label>
						<div className="flex gap-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="imageSource"
									value="default"
									checked={useDefaultImage}
									onChange={() => handleImageSourceChange('default')}
									className="w-4 h-4 text-blue-600 cursor-pointer"
								/>
								<span className="text-sm text-gray-700">Use resource type default image</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="imageSource"
									value="custom"
									checked={!useDefaultImage}
									onChange={() => handleImageSourceChange('custom')}
									className="w-4 h-4 text-blue-600 cursor-pointer"
								/>
								<span className="text-sm text-gray-700">Use custom image</span>
							</label>
						</div>
					</div>

					{!useDefaultImage && <RHFImageInput name="image" label="Custom Image" />}
				</div>
			</div>
		</FormShell>
	);
}
