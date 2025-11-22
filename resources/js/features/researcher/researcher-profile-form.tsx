import { router, Form } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/i18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface Experience {
    id?: number;
    title: string;
    company: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    is_current: boolean;
}

export interface Education {
    id?: number;
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

export interface Major {
    id: number;
    name: string;
    slug: string;
}

export interface ResearcherProfileData {
    profile: {
        id: number;
        bio: string;
        website?: string;
        phone?: string;
        address?: string;
        linkedin_url?: string;
        github_url?: string;
    } | null;
    experiences: Experience[];
    educations: Education[];
    majors: Major[];
    selected_majors: number[];
}

type FieldErrors<T> = Partial<Record<keyof T, string>> & { form?: string };
type ExperienceErrors = FieldErrors<Experience>;
type EducationErrors = FieldErrors<Education>;
type FlashMessage = { type: 'success' | 'error'; text: string } | null;

const defaultExperience: Experience = {
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false,
};

const defaultEducation: Education = {
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
};

export default function ResearcherProfileForm({
    profile,
    experiences,
    educations,
    majors,
    selected_majors,
}: ResearcherProfileData) {
    const [editingExperience, setEditingExperience] = useState<number | null>(null);
    const [editingEducation, setEditingEducation] = useState<number | null>(null);
    const [newExperience, setNewExperience] = useState<Experience>({ ...defaultExperience });
    const [newEducation, setNewEducation] = useState<Education>({ ...defaultEducation });
    const [selectedMajors, setSelectedMajors] = useState<number[]>(selected_majors || []);
    const [experienceErrors, setExperienceErrors] = useState<ExperienceErrors>({});
    const [educationErrors, setEducationErrors] = useState<EducationErrors>({});
    const [experienceFeedback, setExperienceFeedback] = useState<FlashMessage>(null);
    const [educationFeedback, setEducationFeedback] = useState<FlashMessage>(null);
    const [experienceProcessing, setExperienceProcessing] = useState(false);
    const [educationProcessing, setEducationProcessing] = useState(false);
    const { t } = useTranslation();

    const hasInvalidDateOrder = (start?: string, end?: string): boolean => {
        if (!start || !end) {
            return false;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
            return false;
        }

        return endDate < startDate;
    };

    const validateExperienceDates = (experience: Experience): ExperienceErrors | null => {
        const errors: ExperienceErrors = {};

        if (!experience.is_current && hasInvalidDateOrder(experience.start_date, experience.end_date)) {
            errors.end_date = 'End date cannot be earlier than start date.';
        }

        return Object.keys(errors).length ? errors : null;
    };

    const validateEducationDates = (education: Education): EducationErrors | null => {
        const errors: EducationErrors = {};

        if (hasInvalidDateOrder(education.start_date, education.end_date)) {
            errors.end_date = 'End date cannot be earlier than start date.';
        }

        return Object.keys(errors).length ? errors : null;
    };

    useEffect(() => {
        if (editingExperience === null) {
            setExperienceErrors({});
        }
    }, [editingExperience]);

    useEffect(() => {
        if (editingEducation === null) {
            setEducationErrors({});
        }
    }, [editingEducation]);

    const handleDeleteExperience = (id: number) => {
        if (confirm(t('researcher.deleteConfirm'))) {
            router.delete(`/researcher/profile/experiences/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleDeleteEducation = (id: number) => {
        if (confirm(t('researcher.deleteConfirm'))) {
            router.delete(`/researcher/profile/educations/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleSubmitExperience = (experience: Experience) => {
        setExperienceFeedback(null);
        setExperienceErrors({});

        const clientErrors = validateExperienceDates(experience);
        if (clientErrors) {
            setExperienceErrors(clientErrors);
            setExperienceFeedback({
                type: 'error',
                text: t('researcher.fixErrors'),
            });
            return;
        }

        const isUpdate = Boolean(experience.id);
        const requestOptions = {
            preserveScroll: true,
            onStart: () => setExperienceProcessing(true),
            onFinish: () => setExperienceProcessing(false),
            onSuccess: () => {
                setExperienceErrors({});
                setExperienceFeedback({
                    type: 'success',
                    text: isUpdate ? t('researcher.experienceUpdated') : t('researcher.experienceAdded'),
                });
                if (isUpdate) {
                    setEditingExperience(null);
                } else {
                    setNewExperience({ ...defaultExperience });
                    setEditingExperience(null);
                }
            },
            onError: (errors: Record<string, string>) => {
                setExperienceErrors(errors as ExperienceErrors);
                setExperienceFeedback({
                    type: 'error',
                    text: t('researcher.fixErrors'),
                });
            },
        };

        if (isUpdate) {
            router.patch(`/researcher/profile/experiences/${experience.id}`, experience, requestOptions);
        } else {
            router.post('/researcher/profile/experiences', experience, requestOptions);
        }
    };

    const openNewExperienceForm = () => {
        setExperienceErrors({});
        setExperienceFeedback(null);
        setNewExperience({ ...defaultExperience });
        setEditingExperience(0);
    };

    const cancelExperienceForm = () => {
        setEditingExperience(null);
        setExperienceErrors({});
        setNewExperience({ ...defaultExperience });
    };

    const openNewEducationForm = () => {
        setEducationErrors({});
        setEducationFeedback(null);
        setNewEducation({ ...defaultEducation });
        setEditingEducation(0);
    };

    const cancelEducationForm = () => {
        setEditingEducation(null);
        setEducationErrors({});
        setNewEducation({ ...defaultEducation });
    };

    const handleSubmitEducation = (education: Education) => {
        setEducationFeedback(null);
        setEducationErrors({});

        const clientErrors = validateEducationDates(education);
        if (clientErrors) {
            setEducationErrors(clientErrors);
            setEducationFeedback({
                type: 'error',
                text: t('researcher.fixErrors'),
            });
            return;
        }

        const isUpdate = Boolean(education.id);
        const requestOptions = {
            preserveScroll: true,
            onStart: () => setEducationProcessing(true),
            onFinish: () => setEducationProcessing(false),
            onSuccess: () => {
                setEducationErrors({});
                setEducationFeedback({
                    type: 'success',
                    text: isUpdate ? t('researcher.educationUpdated') : t('researcher.educationAdded'),
                });
                if (isUpdate) {
                    setEditingEducation(null);
                } else {
                    setNewEducation({ ...defaultEducation });
                    setEditingEducation(null);
                }
            },
            onError: (errors: Record<string, string>) => {
                setEducationErrors(errors as EducationErrors);
                setEducationFeedback({
                    type: 'error',
                    text: t('researcher.fixErrors'),
                });
            },
        };

        if (isUpdate) {
            router.patch(`/researcher/profile/educations/${education.id}`, education, requestOptions);
        } else {
            router.post('/researcher/profile/educations', education, requestOptions);
        }
    };

    return (
        <div className="space-y-8 p-6">
            {/* Profile Information */}
            <div className="space-y-6">
                <HeadingSmall
                    title={t('researcher.infoSection')}
                    description={t('researcher.infoDescription')}
                />

                <Form
                    method="patch"
                    action="/researcher/profile/update"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                    data={{
                        major_ids: selectedMajors,
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="bio">{t('researcher.bio')} *</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    defaultValue={profile?.bio || ''}
                                    required
                                    rows={6}
                                    placeholder={t('researcher.bioPlaceholder')}
                                />
                                <InputError message={errors.bio} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                        <Label htmlFor="website">{t('researcher.website')}</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        name="website"
                                        defaultValue={profile?.website || ''}
                                        placeholder="https://example.com"
                                    />
                                    <InputError message={errors.website} />
                                </div>

                                <div className="grid gap-2">
                                        <Label htmlFor="phone">{t('researcher.phone')}</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={profile?.phone || ''}
                                        placeholder="+966-555-123-456"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                        <Label htmlFor="address">{t('researcher.address')}</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        defaultValue={profile?.address || ''}
                                        placeholder="Riyadh, Saudi Arabia"
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                        <Label htmlFor="linkedin_url">{t('researcher.linkedin')}</Label>
                                    <Input
                                        id="linkedin_url"
                                        type="url"
                                        name="linkedin_url"
                                        defaultValue={profile?.linkedin_url || ''}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                    <InputError message={errors.linkedin_url} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                        <Label htmlFor="github_url">{t('researcher.github')}</Label>
                                    <Input
                                        id="github_url"
                                        type="url"
                                        name="github_url"
                                        defaultValue={profile?.github_url || ''}
                                        placeholder="https://github.com/username"
                                    />
                                    <InputError message={errors.github_url} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>{t('researcher.researchAreas')}</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {majors.map((major) => (
                                        <label
                                            key={major.id}
                                            className="flex cursor-pointer items-center space-x-3 rounded-lg border border-input bg-background p-4 text-sm font-medium shadow-sm transition hover:border-primary"
                                        >
                                            <Checkbox
                                                checked={selectedMajors.includes(major.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedMajors((prev) =>
                                                        checked
                                                            ? [...prev, major.id]
                                                            : prev.filter((id) => id !== major.id)
                                                    );
                                                }}
                                            />
                                            <span>{major.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.major_ids} />
                            </div>

                            <Button disabled={processing}>{t('researcher.saveProfile')}</Button>
                        </>
                    )}
                </Form>
            </div>

            {/* Experiences */}
            <div className="space-y-6">
                <HeadingSmall
                    title={t('researcher.experienceSection')}
                    description={t('researcher.experienceDescription')}
                />

                {experienceFeedback && (
                    <Alert
                        variant={experienceFeedback.type === 'error' ? 'destructive' : 'default'}
                        className="border"
                    >
                        <AlertTitle>
                            {experienceFeedback.type === 'error'
                                ? t('notifications.error')
                                : t('notifications.success')}
                        </AlertTitle>
                        <AlertDescription>{experienceFeedback.text}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4">
                    {experiences.map((experience) => (
                        <div
                            key={experience.id}
                            className="rounded-lg border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{experience.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {experience.company}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {experience.start_date} -{' '}
                                        {experience.is_current ? 'Present' : experience.end_date}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingExperience(experience.id!)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteExperience(experience.id!)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {editingExperience === experience.id && (
                                <ExperienceForm
                                    experience={experience}
                                    errors={experienceErrors}
                                    submitting={experienceProcessing}
                                    onSubmit={handleSubmitExperience}
                                    onCancel={() => setEditingExperience(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-dashed p-4">
                        <button
                            type="button"
                            onClick={openNewExperienceForm}
                            className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground"
                        >
                            <Plus className="h-4 w-4" /> {t('researcher.addExperience')}
                        </button>
                </div>

                {editingExperience === 0 && (
                    <ExperienceForm
                        experience={newExperience}
                        errors={experienceErrors}
                        submitting={experienceProcessing}
                        onSubmit={handleSubmitExperience}
                        onCancel={cancelExperienceForm}
                    />
                )}
            </div>

            {/* Education */}
            <div className="space-y-6">
                <HeadingSmall
                    title={t('researcher.educationSection')}
                    description={t('researcher.educationDescription')}
                />

                {educationFeedback && (
                    <Alert
                        variant={educationFeedback.type === 'error' ? 'destructive' : 'default'}
                        className="border"
                    >
                        <AlertTitle>
                            {educationFeedback.type === 'error'
                                ? t('notifications.error')
                                : t('notifications.success')}
                        </AlertTitle>
                        <AlertDescription>{educationFeedback.text}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4">
                    {educations.map((education) => (
                        <div
                            key={education.id}
                            className="rounded-lg border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{education.degree}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {education.institution} - {education.field_of_study}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {education.start_date} - {education.end_date}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingEducation(education.id!)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteEducation(education.id!)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {editingEducation === education.id && (
                                <EducationForm
                                    education={education}
                                    errors={educationErrors}
                                    submitting={educationProcessing}
                                    onSubmit={handleSubmitEducation}
                                    onCancel={() => setEditingEducation(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-dashed p-4">
                        <button
                            type="button"
                            onClick={openNewEducationForm}
                            className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground"
                        >
                            <Plus className="h-4 w-4" /> {t('researcher.addEducation')}
                        </button>
                </div>

                {editingEducation === 0 && (
                    <EducationForm
                        education={newEducation}
                        errors={educationErrors}
                        submitting={educationProcessing}
                        onSubmit={handleSubmitEducation}
                        onCancel={cancelEducationForm}
                    />
                )}
            </div>
        </div>
    );
}

function ExperienceForm({
    experience,
    errors,
    submitting,
    onSubmit,
    onCancel,
}: {
    experience: Experience;
    errors: ExperienceErrors;
    submitting: boolean;
    onSubmit: (experience: Experience) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Experience>(experience);
    const { t } = useTranslation();

    useEffect(() => {
        setFormData(experience);
    }, [experience]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-md border bg-muted/40 p-4">
            <div className="grid gap-2">
                <Label htmlFor={`title-${experience.id}`}>{t('researcher.title')}</Label>
                <Input
                    id={`title-${experience.id}`}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <InputError message={errors.title} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`company-${experience.id}`}>{t('researcher.company')}</Label>
                <Input
                    id={`company-${experience.id}`}
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                />
                <InputError message={errors.company} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`start_date-${experience.id}`}>{t('researcher.startDate')}</Label>
                    <Input
                        id={`start_date-${experience.id}`}
                        type="date"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                    <InputError message={errors.start_date} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`end_date-${experience.id}`}>{t('researcher.endDate')}</Label>
                    <Input
                        id={`end_date-${experience.id}`}
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        disabled={formData.is_current}
                    />
                    <InputError message={errors.end_date} />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`is_current-${experience.id}`}
                    checked={formData.is_current}
                    onCheckedChange={(checked) =>
                        setFormData({
                            ...formData,
                            is_current: Boolean(checked),
                            end_date: checked ? '' : formData.end_date,
                        })
                    }
                />
                <label htmlFor={`is_current-${experience.id}`} className="text-sm">
                    {t('researcher.currentlyWorking')}
                </label>
            </div>
            <InputError message={errors.is_current} />
            <div className="grid gap-2">
                <Label htmlFor={`description-${experience.id}`}>{t('researcher.description')}</Label>
                <Textarea
                    id={`description-${experience.id}`}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                />
                <InputError message={errors.description} />
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                    {t('actions.save')}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    <X className="mr-2 h-4 w-4" /> {t('actions.cancel')}
                </Button>
            </div>
        </form>
    );
}

function EducationForm({
    education,
    errors,
    submitting,
    onSubmit,
    onCancel,
}: {
    education: Education;
    errors: EducationErrors;
    submitting: boolean;
    onSubmit: (education: Education) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Education>(education);
    const { t } = useTranslation();

    useEffect(() => {
        setFormData(education);
    }, [education]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-md border bg-muted/40 p-4">
            <div className="grid gap-2">
                <Label htmlFor={`institution-${education.id}`}>{t('researcher.institution')}</Label>
                <Input
                    id={`institution-${education.id}`}
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                />
                <InputError message={errors.institution} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`degree-${education.id}`}>{t('researcher.degree')}</Label>
                <Input
                    id={`degree-${education.id}`}
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    required
                />
                <InputError message={errors.degree} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`field_of_study-${education.id}`}>{t('researcher.field')}</Label>
                <Input
                    id={`field_of_study-${education.id}`}
                    value={formData.field_of_study || ''}
                    onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                />
                <InputError message={errors.field_of_study} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`edu_start_date-${education.id}`}>{t('researcher.startDate')}</Label>
                    <Input
                        id={`edu_start_date-${education.id}`}
                        type="date"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                    <InputError message={errors.start_date} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`edu_end_date-${education.id}`}>{t('researcher.endDate')}</Label>
                    <Input
                        id={`edu_end_date-${education.id}`}
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                    <InputError message={errors.end_date} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edu_description-${education.id}`}>{t('researcher.description')}</Label>
                <Textarea
                    id={`edu_description-${education.id}`}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                />
                <InputError message={errors.description} />
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                    {t('actions.save')}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    <X className="mr-2 h-4 w-4" /> {t('actions.cancel')}
                </Button>
            </div>
        </form>
    );
}
