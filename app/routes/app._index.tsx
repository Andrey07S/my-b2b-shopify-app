import type { HeadersFunction } from 'react-router';
import { useActionData, useLoaderData } from 'react-router';

import { boundary } from '@shopify/shopify-app-react-router/server';

import { homeAction, homeLoader } from '@/pages/home/api/home.server';
import { HomePage } from '@/pages/home/ui/HomePage';

export const loader = homeLoader;
export const action = homeAction;

const HomeRoute = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <HomePage loaderData={loaderData} actionData={actionData} />;
};

export default HomeRoute;

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
