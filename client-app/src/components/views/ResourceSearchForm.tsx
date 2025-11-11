import { useState } from 'react';
import FormInput from '@/components/forms/base/FormInput';
import Button from '@/components/ui/Button';
import type { Department } from '@/types/department';
import type { Municipality } from '@/types/municipality';

interface ResourceSearchFormProps {
	resourceTypes: string[];
	departments: Department[];
	municipalities: Municipality[];
	selectedType: string;
	setSelectedType: (type: string) => void;
	selectedDepartment: string;
	setSelectedDepartment: (dept: string) => void;
	selectedMunicipality: string;
	setSelectedMunicipality: (muni: string) => void;
	onSearch: () => void;
}

const ResourceSearchForm: React.FC<ResourceSearchFormProps> = ({
	resourceTypes,
	departments,
	municipalities,
	selectedType,
	setSelectedType,
	selectedDepartment,
	setSelectedDepartment,
	selectedMunicipality,
	setSelectedMunicipality,
	onSearch,
}) => {
	const [errors, setErrors] = useState<{
		resourceType?: string;
		municipality?: string;
		department?: string;
	}>({});

	const handleSearch = (e?: React.MouseEvent<HTMLButtonElement>) => {
		e?.preventDefault();
		onSearch();
	};

	return (
		<form className="flex flex-col md:flex-row gap-4 mb-6 items-end">
			<div className="flex-1">
				<FormInput
					label="Resource Type"
					name="resourceType"
					type="select"
					value={selectedType}
					onChange={e => {
						setSelectedType(e.target.value);
						if (e.target.value && errors.resourceType) {
							setErrors(prev => {
								const newErrors = { ...prev };
								delete newErrors.resourceType;
								return newErrors;
							});
						}
					}}
					error={errors.resourceType}
					showValidation={!!errors.resourceType}
					options={[
						{ value: '', label: 'All' },
						...resourceTypes.map(type => ({ value: type, label: type })),
					]}
				/>
			</div>

			<div className="flex-1">
				<FormInput
					label="Municipality"
					name="municipality"
					type="select"
					value={selectedMunicipality}
					onChange={e => {
						setSelectedMunicipality(e.target.value);
						if (e.target.value && errors.municipality) {
							setErrors(prev => {
								const newErrors = { ...prev };
								delete newErrors.municipality;
								return newErrors;
							});
						}
					}}
					options={[
						{ value: '', label: 'All' },
						...municipalities.map((m: Municipality) => ({
							value: m.municipalityId,
							label: m.name,
						})),
					]}
				/>
			</div>

			<div className="flex-1">
				<FormInput
					label="Department"
					name="department"
					type="select"
					value={selectedDepartment}
					onChange={e => {
						setSelectedDepartment(e.target.value);
						if (e.target.value && errors.department) {
							setErrors(prev => {
								const newErrors = { ...prev };
								delete newErrors.department;
								return newErrors;
							});
						}
					}}
					options={[
						{ value: '', label: 'All' },
						...departments.map((d: Department) => ({
							value: d.departmentId,
							label: d.name,
						})),
					]}
				/>
			</div>

			<div className="flex-shrink-0">
				<Button type="button" variant="primary" className="w-full md:w-auto" onClick={handleSearch}>
					Search
				</Button>
			</div>
		</form>
	);
};

export default ResourceSearchForm;
