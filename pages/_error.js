import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

const MyError = Error;

// Replace "YourCustomErrorComponent" with your custom error component!
MyError.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData);

  // ...other getInitialProps code

  return Error.getInitialProps(contextData);
};

export default MyError;
