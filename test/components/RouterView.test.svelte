<script lang="ts">
  import type { RouterViewProps } from '~/models/component.model';

  import RouterView from '~/components/RouterView.svelte';

  const { options, router, onError, onEnd, onStart, beforeEach, onChange, onLoading, onLoaded, transition }: RouterViewProps = $props();
</script>

<RouterView {options} {router} {onError} {onEnd} {onStart} {beforeEach} {onChange} {onLoading} {onLoaded} {transition}>
  {#snippet loading()}
    <div data-testid="default-loading"><h1>Default Loading</h1></div>
  {/snippet}
  {#snippet error(_error)}
    <div data-testid="default-error">
      <h1>Default Error</h1>
      {#if _error}
        <p data-testid="error-message">{_error?.message ?? _error}</p>
      {/if}
    </div>
  {/snippet}
  {#snippet routing(_routing)}
    <div data-testid="default-routing">
      <h1>Default Routing</h1>
      <span data-testid="routing-from">{_routing?.from?.location?.name}</span>
      <span data-testid="routing-to">{_routing?.to?.name}</span>
    </div>
  {/snippet}
</RouterView>
