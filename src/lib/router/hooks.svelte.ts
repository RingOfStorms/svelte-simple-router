import { hasContext } from 'svelte';

import type { RouteName } from '~/models/route.model.js';

import type { IView } from '~/models/view.model.js';

import {
  type ErrorListener,
  type LoadingErrorListener,
  MissingRouterContextError,
  MissingViewContextError,
  type NavigationEndListener,
  type NavigationErrorListener,
  type NavigationGuard,
  type NavigationListener,
  type ViewChangeListener,
} from '~/models/index.js';
import { type IRouter } from '~/models/router.model.js';
import { getRouter, getView, RouterContextSymbol, RouterViewSymbol } from '~/router/context.svelte.js';

/**
 * Returns true if a router is available.
 */
export const hasRouter = (): boolean => {
  return hasContext(RouterContextSymbol);
};

/**
 * Returns the current router instance.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const useRouter = <Name extends RouteName = any>(): IRouter<Name> => {
  const router = getRouter<Name>();
  if (!router) throw new MissingRouterContextError();
  return router;
};

/**
 * Returns true if a view is available.
 */
export const hasView = (): boolean => {
  return hasContext(RouterViewSymbol);
};

/**
 * Returns the current view instance.
 * @throws {MissingViewContextError} when no view is available.
 */
export const useView = <Name extends RouteName = any>(): IView<Name> => {
  const view = getView<Name>();
  if (!view) throw new MissingViewContextError();
  return view;
};

/**
 * Returns the current route information.
 *
 * To track reactivity, it must be used inside a tracking context
 *
 * @throws {MissingRouterContextError} when no router is available.
 *
 * @example `
 *  const { route, location, routing } = useRoute<Name>();
 *
 *  const $route = $derived(route);
 *  const $location = $derived(location);
 *  const $routing = $derived(routing);
 * `
 */
export const useRoute = <Name extends RouteName = any>(): Pick<IRouter<Name>, 'route' | 'location' | 'routing'> => {
  const router = useRouter<Name>();
  return {
    route: router.route,
    location: router.location,
    routing: router.routing,
  };
};

/**
 * Returns navigation methods to navigate the route stack.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const useNavigate = <Name extends RouteName = any>(): Pick<IRouter<Name>, 'push' | 'replace' | 'resolve' | 'back' | 'forward' | 'go'> => {
  const router = useRouter<Name>();
  return {
    resolve: router.resolve.bind(router),
    push: router.push.bind(router),
    replace: router.replace.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router),
    go: router.go.bind(router),
  };
};

/**
 * Add a listener that is executed before each navigation.
 * @param callback
 * @param router - optional router instance to use.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const beforeEach = <Name extends RouteName = any>(callback: NavigationGuard<Name>, router: IRouter<Name> = useRouter<Name>()) => {
  $effect.pre(() => {
    return router.beforeEach(callback);
  });
};

/**
 * Add a listener that is executed when a navigation starts.
 * @param callback
 * @param router - optional router instance to use.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const onStart = <Name extends RouteName = any>(callback: NavigationListener<Name>, router: IRouter<Name> = useRouter<Name>()) => {
  $effect.pre(() => {
    return router.onStart(callback);
  });
};

/**
 * Add a listener that is executed when a navigation ends.
 * @param callback
 * @param router - optional router instance to use.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const onEnd = <Name extends RouteName = any>(callback: NavigationEndListener<Name>, router: IRouter<Name> = useRouter<Name>()) => {
  $effect.pre(() => {
    return router.onEnd(callback);
  });
};

/**
 * Add a listener that is executed when a view changes.
 * @param callback
 * @param view - optional view instance to use.
 * @throws {MissingViewContextError} when no view is available.
 */
export const onChange = <Name extends RouteName = any>(callback: ViewChangeListener<Name>, view: IView<Name> = useView<Name>()) => {
  $effect.pre(() => {
    return view.onChange(callback);
  });
};

/**
 * Add a listener that is executed when a view finish loading a component.
 * @param callback
 * @param view - optional view instance to use.
 * @throws {MissingViewContextError} when no view is available.
 */
export const onLoaded = <Name extends RouteName = any>(callback: ViewChangeListener<Name>, view: IView<Name> = useView<Name>()) => {
  $effect.pre(() => {
    return view.onLoaded(callback);
  });
};

/**
 * Add a listener that is executed when a view start loading a component.
 * @param callback
 * @param view - optional view instance to use.
 * @throws {MissingViewContextError} when no view is available.
 */
export const onLoading = <Name extends RouteName = any>(callback: ViewChangeListener<Name>, view: IView<Name> = useView<Name>()) => {
  $effect.pre(() => {
    return view.onLoading(callback);
  });
};

/**
 * Add a listener that is executed when a navigation error occurs.
 * @param callback
 * @param router - optional router instance to use.
 * @throws {MissingRouterContextError} when no router is available.
 */
export const onRouterError = <Name extends RouteName = any>(callback: NavigationErrorListener<Name>, router: IRouter<Name> = useRouter<Name>()) => {
  $effect.pre(() => {
    return router.onError(callback);
  });
};

/**
 * Add a listener that is executed when an error occurs during view loading.
 * @param callback
 * @param view - optional view instance to use.
 * @throws {MissingViewContextError} when no view is available.
 */
export const onViewError = <Name extends RouteName = any>(callback: LoadingErrorListener<Name>, view: IView<Name> = useView<Name>()) => {
  $effect.pre(() => {
    return view.onError(callback);
  });
};

/**
 * Add a listener that is executed when an error occurs during view loading or router navigation.
 * @param callback
 * @param router - optional router instance to use.
 * @param view - optional view instance to use.
 * @throws {MissingRouterContextError} when no router is available.
 * @throws {MissingViewContextError} when no view is available.
 */
export const onError = <Name extends RouteName = any>(
  callback: ErrorListener<Name>,
  { router = useRouter<Name>(), view = useView<Name>() }: { router?: IRouter<Name>; view?: IView<Name> } = {},
) => {
  $effect.pre(() => {
    const unsubscribeRouter = router.onError(callback);
    const unsubscribeView = view.onError(callback);
    return () => {
      unsubscribeRouter();
      unsubscribeView();
    };
  });
};