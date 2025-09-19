export type ActionKey =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'uploadPicture';

export interface ResourcePermission {
  resource: string;
  actions: Partial<Record<ActionKey, boolean>>;
}

export interface Role {
  id?: string;
  name: string;
  permissions: ResourcePermission[];
}
