import { useEffect, useState } from 'react';
import * as hooks from './hooks/index';
import * as constants from './constants/index';
import type {
  Runtime,
  Dimensions
} from './interfaces';

interface Store {
  on_mount: Function,
  on_change: Function,
  get: Function,
  add_to_handlers: Function
}

const runtime_store = ((): Store => {
  let store: any = {
    deps: null,
    funcs: []
  };
  return {
    on_mount: (deps: Runtime|((arg: any) => Runtime) = (arg: any): Runtime => arg) => {
      if (typeof deps === 'function') {
        return store.deps = deps(store.deps);
      }
      store.deps = Object.assign({}, store.deps, deps);
    },
    on_change: (deps: Runtime|((arg: any) => Runtime) = (arg: any): Runtime => arg) => {
      if (typeof deps === 'function') {
        store.deps = deps(store.deps);
      } else {
        store.deps = Object.assign({}, store.deps, deps);
      }
      store.funcs.forEach((func: Function) => func(store.deps));
    },
    add_to_handlers: (func: Function) => {
      store.funcs.push(func);
    },
    get: (): Runtime => store.deps
  }
})();

const use_core = (opts: { dimensions: Dimensions }): Runtime => {
  const queries = hooks.use_queries();
  const ethereum = hooks.use_ethereum({ queries });
  const task = hooks.use_task({ ethereum, queries });
  const hardhat = hooks.use_hardhat({ ethereum, queries });
  const reth_collateral = hooks.use_reth_collateral({ ethereum, hardhat, queries });
  const account = hooks.use_account({ task, ethereum, hardhat, constants, queries });
  const validators = hooks.use_validators({ reth_collateral, account, queries });
  const toast = hooks.use_toast({ account, constants, queries });
  const settings = hooks.use_settings();
  const runtime: Runtime = {
    ethereum,
    hardhat,
    queries,
    constants,
    account,
    settings,
    reth_collateral,
    toast,
    task,
    validators,
    ...opts
  };  
  return runtime
};

export const use_runtime = (): Runtime => {
  const [deps, setDeps] = useState(runtime_store.get());
  useEffect(() => {
    runtime_store.add_to_handlers(setDeps);
  }, []);
  return deps;
};

export const RuntimeProvider = (props: { children: any, dimensions: Dimensions }) => {
  const core = use_core({ dimensions: props.dimensions });
  useEffect(() => {
    runtime_store.on_mount(core)
  }, []);
  useEffect(() => {
    runtime_store.on_change(core);
  }, [core])
  return props.children;
};