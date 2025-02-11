<script lang="ts">
  import type { RouterOptions } from '~/models/router.model.js';

  let {
    options = $bindable({
      listen: 'history',
      syncUpdate: 'replace',
      syncDebounce: 0,
      base: '/svelte-simple-router',
      hash: true,
      strict: false,
      failOnNotFound: false,
      metaAsState: false,
      nameAsTitle: false,
      followGuardRedirects: true,
      caseSensitive: false,
      beforeEach: navigation => {
        console.info('Option before each', navigation);
      },
      onStart: navigation => {
        console.info('Option on start', navigation);
      },
      onEnd: (navigation, resolved) => {
        console.info('Option on end', { navigation, resolved });
      },
      onError: (err, navigation) => {
        console.error('Option on error', { err, ...navigation });
      },
    }),
    stripQuery = $bindable(false),
    stripHash = $bindable(false),
    stripTrailingHash = $bindable(false),
  }: { options: RouterOptions; stripQuery?: boolean; stripHash?: boolean; stripTrailingHash?: boolean } = $props();

  const configs = $derived(Object.entries(options).filter(([_, v]) => typeof v === 'string' || typeof v === 'boolean')) as [
    keyof RouterOptions,
    string | boolean,
  ][];

  let input = $state(`${options?.base ?? ''}${options?.hash ? '/#' : ''}/hello`);
  const onInputButton = () => {
    console.info('onInputButton', input);
    window.history.pushState({}, '', window.location.origin + input);
  };

  const title = {
    listen: `In 'navigation' or 'history' mode, the router listen to popstate or navigation events. If both demo routers are not in the same mode (e.g., 'hash' or 'path'), routing conflicts may occur.`,
    hash: `In 'navigation' or 'history' mode, the router listen to popstate or navigation events. If both demo routers are not in the same mode (e.g., 'hash' or 'path'), routing conflicts may occur.`,
  };

  // convert pascal case to title case
  const toTitleCase = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, _str => _str.toUpperCase());
</script>

<div class="row">
  <div class="column">
    <h3>Options</h3>
    <table class="options">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each configs as [key, value]}
          <tr title={title[key]}>
            <td>{toTitleCase(key)}</td>
            <td>
              {#if key === 'base'}
                <input type="text" bind:value={options[key]} />
              {:else if key === 'listen'}
                <select bind:value={options[key]}>
                  <option value={'history'}>History</option>
                  <option value={'navigation'}>Navigation</option>
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              {:else if key === 'syncUpdate'}
                <select bind:value={options[key]}>
                  <option value={'replace'}>Replace</option>
                  <option value={'push'}>Push</option>
                  <option value={false}>False</option>
                </select>
              {:else if typeof value === 'boolean'}
                <input type="checkbox" bind:checked={options[key]} />
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="row">
  <div class="column">
    <h3>External Push state</h3>
    <table class="options">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><label for="stripQuery">Strip Query</label></td>
          <td><input id="stripQuery" type="checkbox" bind:checked={stripQuery} /></td>
        </tr>
        <tr>
          <td><label for="stripHash">Strip Hash</label></td>
          <td><input id="stripHash" type="checkbox" bind:checked={stripHash} /></td>
        </tr>
        <tr>
          <td><label for="stripTrailingHash">Strip Trailing Hash</label></td>
          <td><input id="stripTrailingHash" type="checkbox" bind:checked={stripTrailingHash} /></td>
        </tr>
        <tr>
          <td><label for="input">External Push State</label></td>
          <td>
            <textarea rows="2" id="input" bind:value={input}></textarea>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <button onclick={onInputButton}>Push State</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style lang="scss">
  .row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  .column {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
  }

  .options {
    padding: 1rem;
    background-color: color-mix(in srgb, transparent, black 20%);
    border-radius: 0.5rem;
  }

  tbody tr {
    td {
      padding: 0.25rem 0.75rem;

      &:not(:first-child) {
        text-align: center;
      }
    }

    &:active,
    &:hover {
      background-color: color-mix(in srgb, transparent, black 40%);
    }
  }
</style>
