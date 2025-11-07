export interface Parameter {
  id: string;
  code: string;
  description: string;
  longDescription?: string;
  parentId?: string;
  displayOrder: number;
  numericValue?: number;
  textValue?: string;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface CreateParameterRequest {
  code: string;
  description: string;
  longDescription?: string;
  parentId?: string;
  displayOrder: number;
  numericValue?: number;
  textValue?: string;
  createdBy?: string;
}

export interface UpdateParameterRequest {
  description?: string;
  longDescription?: string;
  displayOrder?: number;
  numericValue?: number;
  textValue?: string;
  modifiedBy?: string;
}
