import { Form } from 'react-router';

import type { SetupStepStatus } from '@/entities/shop-setup';
import { FORM_INTENT } from '@/shared/config/constants';

type ActivationPanelProps = {
  steps: SetupStepStatus[];
  isSetupOk: boolean;
  isSetupFailed: boolean;
  isActivating: boolean;
  setupErrorMessage: string | null;
};

export const ActivationPanel = ({
  steps,
  isSetupOk,
  isSetupFailed,
  isActivating,
  setupErrorMessage,
}: ActivationPanelProps) => {
  const enabledCount = steps.filter((step) => step.ok).length;

  return (
    <s-section heading='Activation'>
      <s-paragraph>Turn on discount, free gift, and B2B minimum order for this shop.</s-paragraph>

      <s-box border='base' borderRadius='base' background='base'>
        <s-box padding='base' paddingBlockEnd='small-200'>
          <s-stack
            direction='inline'
            gap='small-200'
            alignItems='center'
            justifyContent='space-between'
          >
            <s-text type='strong'>Shop features</s-text>
            <s-badge
              tone={isSetupOk ? 'success' : 'caution'}
              icon={isSetupOk ? 'check-circle' : 'clock'}
            >
              {enabledCount}/{steps.length} on
            </s-badge>
          </s-stack>
        </s-box>

        {steps.map((step, index) => (
          <s-box key={step.key}>
            {index > 0 ? <s-divider /> : null}
            <s-box padding='base'>
              <s-stack
                direction='inline'
                gap='base'
                alignItems='center'
                justifyContent='space-between'
              >
                <s-stack direction='inline' gap='small-200' alignItems='center'>
                  <s-icon
                    type={step.ok ? 'check-circle' : 'circle-dashed'}
                    tone={step.ok ? 'success' : 'neutral'}
                  />
                  <s-stack gap='none'>
                    <s-text type='strong'>{step.label}</s-text>
                    {!step.ok ? <s-text color='subdued'>{step.detail}</s-text> : null}
                  </s-stack>
                </s-stack>
                <s-badge tone={step.ok ? 'success' : 'warning'}>{step.ok ? 'On' : 'Off'}</s-badge>
              </s-stack>
            </s-box>
          </s-box>
        ))}
      </s-box>

      <s-box paddingBlockStart='base'>
        <Form method='post' id='activate-form'>
          <input type='hidden' name='intent' value={FORM_INTENT.setup} />
          {isSetupOk ? (
            <s-button type='button' variant='secondary' icon='check-circle' disabled>
              Activated
            </s-button>
          ) : (
            <s-button
              type='submit'
              variant='primary'
              icon={isSetupFailed ? 'refresh' : 'play'}
              {...(isActivating ? { loading: true } : {})}
            >
              {isSetupFailed ? 'Try again' : 'Activate shop features'}
            </s-button>
          )}
        </Form>
      </s-box>

      {isSetupFailed || !isSetupOk ? (
        <s-box paddingBlockStart='base'>
          {isSetupFailed ? (
            <s-banner tone='critical' heading='Something went wrong'>
              {setupErrorMessage ||
                'Activation did not finish. Check the steps above and try again.'}
            </s-banner>
          ) : (
            <s-banner tone='info' heading='Ready when you are'>
              Activation is manual — click Activate to create the discount, free gift cart
              transform, and B2B validation.
            </s-banner>
          )}
        </s-box>
      ) : null}
    </s-section>
  );
};
