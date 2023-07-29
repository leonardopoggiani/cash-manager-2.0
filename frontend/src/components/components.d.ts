import { ReactNode } from 'react';


// Define a custom type for ProtectedRouteProps with the element prop
interface CustomProtectedRouteProps extends RouteProps {
  element: React.ReactElement;
  isLoggedIn: boolean;
  path: string;
}
