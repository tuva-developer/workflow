import { FormQuery, GroupQuery, InstanceQuery, ModelCategoryQuery, ModelQuery, ModelTypeQuery, ScheduleQuery, TaskQuery, UserQuery } from "@/services/types";
import { TemplateQuery } from "@/services/types";

export const qk = {
    usersRoot: ['users'] as const,
    users: (params?: UserQuery) =>
        ['users', params ?? {}] as const,
    user: (id: string) => ['user', id] as const,

    groupsRoot: ['groups'] as const,
    groups: (params?: GroupQuery) =>
        ['groups', params ?? {}] as const,
    group: (id: string) => ['group', id] as const,

    modelsRoot: ['models'] as const,
    models: (variant: 'all' | 'editable' | 'execute', params?: ModelQuery) =>
        ['models', variant, params ?? {}] as const,
    model: (id: string) => ['model', id] as const,
    modelPermission: (id: string) => ['modelPermission', id] as const,

    instancesRoot: ['instances'] as const,
    instances: (params?: InstanceQuery) =>
        ['instances', params ?? {}] as const,
    instance: (id: string) => ['instance', id] as const,

    modelTypesRoot: ['modelTypes'] as const,
    modelTypes: (params?: ModelTypeQuery) =>
        ['modelTypes', params ?? {}] as const,
    modelType: (id: string) => ['modelType', id] as const,

    modelCategoriesRoot: ['modelCategories'] as const,
    modelCategories: (params?: ModelCategoryQuery) =>
        ['modelCategories', params ?? {}] as const,
    modelCategory: (id: string) => ['modelCategory', id] as const,

    tasksRoot: ['tasks'] as const,
    tasks: (params?: TaskQuery) => ['tasks', params ?? {}] as const,
    task: (id: string) => ['task', id] as const,

    schedulesRoot: ['schedules'] as const,
    schedules: (params?: ScheduleQuery) => ['schedules', params ?? {}] as const,
    schedule: (id: string) => ['schedule', id] as const,

    formsRoot: ['forms'] as const,
    forms: (params?: FormQuery) => ['forms', params ?? {}] as const,
    form: (formName: string) => ['form', formName] as const,

    templatesRoot: ['templates'] as const,
    templates: (params?: TemplateQuery) => ['templates', params ?? {}] as const,
    template: (id: string) => ['template', id] as const,
};