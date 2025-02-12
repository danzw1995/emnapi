function napi_open_handle_scope (env: napi_env, result: Pointer<napi_handle_scope>): emnapi.napi_status {
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [result], () => {
      const scope = envObject.openScope(emnapi.HandleScope)
      HEAP32[result >> 2] = scope.id
      return emnapi.napi_clear_last_error(env)
    })
  })
}

function napi_close_handle_scope (env: napi_env, scope: napi_handle_scope): emnapi.napi_status {
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [scope], () => {
      const scopeObject = envObject.scopeStore.get(scope)!
      if ((envObject.openHandleScopes === 0) || (scopeObject !== envObject.getCurrentScope())) {
        return emnapi.napi_status.napi_handle_scope_mismatch
      }

      try {
        envObject.closeScope(envObject.scopeStore.get(scope)!)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
      return emnapi.napi_clear_last_error(env)
    })
  })
}

function napi_open_escapable_handle_scope (env: napi_env, result: Pointer<napi_escapable_handle_scope>): emnapi.napi_status {
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [result], () => {
      const scope = envObject.openScope(emnapi.EscapableHandleScope)
      HEAP32[result >> 2] = scope.id
      return emnapi.napi_clear_last_error(env)
    })
  })
}

function napi_close_escapable_handle_scope (env: napi_env, scope: napi_escapable_handle_scope): emnapi.napi_status {
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [scope], () => {
      const scopeObject = envObject.scopeStore.get(scope)!
      if ((envObject.openHandleScopes === 0) || (scopeObject !== envObject.getCurrentScope())) {
        return emnapi.napi_status.napi_handle_scope_mismatch
      }

      try {
        envObject.closeScope(envObject.scopeStore.get(scope)!)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
      return emnapi.napi_clear_last_error(env)
    })
  })
}

function napi_escape_handle (env: napi_env, scope: napi_escapable_handle_scope, escapee: napi_value, result: Pointer<napi_value>): emnapi.napi_status {
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [scope, escapee, result], () => {
      try {
        const scopeObject = envObject.scopeStore.get(scope) as emnapi.EscapableHandleScope
        if (!scopeObject.escapeCalled()) {
          const newHandle = scopeObject.escape(escapee)
          HEAP32[result >> 2] = newHandle ? newHandle.id : 0
          return emnapi.napi_clear_last_error(env)
        }
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_escape_called_twice)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

function napi_create_reference (
  env: napi_env,
  value: napi_value,
  initial_refcount: uint32_t,
  result: Pointer<napi_ref>
): emnapi.napi_status {
  if (!emnapi.supportFinalizer) return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [value, result], () => {
      try {
        const handle = envObject.handleStore.get(value)!
        if (!(handle.isObject() || handle.isFunction())) {
          return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_object_expected)
        }
        const ref = emnapi.Reference.create(env, handle.id, initial_refcount >>> 0, false)
        HEAP32[result >> 2] = ref.id
        return emnapi.napi_clear_last_error(env)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

function napi_delete_reference (
  env: napi_env,
  ref: napi_ref
): emnapi.napi_status {
  if (!emnapi.supportFinalizer) return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [ref], () => {
      try {
        emnapi.Reference.doDelete(envObject.refStore.get(ref)!)
        return emnapi.napi_clear_last_error(env)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

function napi_reference_ref (
  env: napi_env,
  ref: napi_ref,
  result: Pointer<uint32_t>
): emnapi.napi_status {
  if (!emnapi.supportFinalizer) return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [ref], () => {
      try {
        const count = envObject.refStore.get(ref)!.ref()
        if (result !== emnapi.NULL) {
          HEAPU32[result >> 2] = count
        }
        return emnapi.napi_clear_last_error(env)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

function napi_reference_unref (
  env: napi_env,
  ref: napi_ref,
  result: Pointer<uint32_t>
): emnapi.napi_status {
  if (!emnapi.supportFinalizer) return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [ref], () => {
      try {
        const reference = envObject.refStore.get(ref)!
        if (reference.refcount === 0) {
          return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
        }
        const count = reference.unref()
        if (result !== emnapi.NULL) {
          HEAPU32[result >> 2] = count
        }
        return emnapi.napi_clear_last_error(env)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

function napi_get_reference_value (
  env: napi_env,
  ref: napi_ref,
  result: Pointer<napi_value>
): emnapi.napi_status {
  if (!emnapi.supportFinalizer) return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_generic_failure)
  return emnapi.checkEnv(env, (envObject) => {
    return emnapi.checkArgs(env, [ref, result], () => {
      try {
        const reference = envObject.refStore.get(ref)!
        const handleId = reference.get()
        if (handleId !== emnapi.NULL) {
          const handle = envObject.handleStore.get(handleId)!
          handle.addRef(reference)
          envObject.getCurrentScope()?.addHandle(handle)
        }
        HEAP32[result >> 2] = handleId
        return emnapi.napi_clear_last_error(env)
      } catch (err) {
        envObject.tryCatch.setError(err)
        return emnapi.napi_set_last_error(env, emnapi.napi_status.napi_pending_exception)
      }
    })
  })
}

emnapiImplement('napi_open_handle_scope', napi_open_handle_scope)
emnapiImplement('napi_close_handle_scope', napi_close_handle_scope)
emnapiImplement('napi_open_escapable_handle_scope', napi_open_escapable_handle_scope)
emnapiImplement('napi_close_escapable_handle_scope', napi_close_escapable_handle_scope)
emnapiImplement('napi_escape_handle', napi_escape_handle)

emnapiImplement('napi_create_reference', napi_create_reference)
emnapiImplement('napi_delete_reference', napi_delete_reference)
emnapiImplement('napi_reference_ref', napi_reference_ref)
emnapiImplement('napi_reference_unref', napi_reference_unref)
emnapiImplement('napi_get_reference_value', napi_get_reference_value)
