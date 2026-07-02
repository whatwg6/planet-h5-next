import type { ErrorComponentProps } from "@tanstack/react-router";

import { AuthRequiredError, ForbiddenAccessError } from "@/app/auth/accessErrors";
import { ErrorState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function RouteErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof AuthRequiredError) {
    return (
      <Page title="登录状态">
        <ErrorState title="登录已失效，请重新登录" />
      </Page>
    );
  }

  if (error instanceof ForbiddenAccessError) {
    return (
      <Page title="无权限">
        <ErrorState title="当前账号没有访问该页面的权限" />
      </Page>
    );
  }

  throw error;
}
