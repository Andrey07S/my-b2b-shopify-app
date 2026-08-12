export type SetupStepStatus = {
  key: 'rules' | 'discount' | 'cartTransform' | 'validation';
  label: string;
  ok: boolean;
  detail: string;
};

export type SetupResult = {
  ok: boolean;
  steps: SetupStepStatus[];
};
