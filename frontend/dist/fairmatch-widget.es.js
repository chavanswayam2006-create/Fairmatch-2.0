import re, { useState as W, useEffect as te } from "react";
var y = { exports: {} }, b = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var z;
function ne() {
  if (z) return b;
  z = 1;
  var c = Symbol.for("react.transitional.element"), m = Symbol.for("react.fragment");
  function u(f, o, i) {
    var d = null;
    if (i !== void 0 && (d = "" + i), o.key !== void 0 && (d = "" + o.key), "key" in o) {
      i = {};
      for (var p in o)
        p !== "key" && (i[p] = o[p]);
    } else i = o;
    return o = i.ref, {
      $$typeof: c,
      type: f,
      key: d,
      ref: o !== void 0 ? o : null,
      props: i
    };
  }
  return b.Fragment = m, b.jsx = u, b.jsxs = u, b;
}
var E = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var D;
function ae() {
  return D || (D = 1, process.env.NODE_ENV !== "production" && (function() {
    function c(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === Q ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case T:
          return "Fragment";
        case J:
          return "Profiler";
        case U:
          return "StrictMode";
        case X:
          return "Suspense";
        case B:
          return "SuspenseList";
        case Z:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case M:
            return "Portal";
          case V:
            return e.displayName || "Context";
          case q:
            return (e._context.displayName || "Context") + ".Consumer";
          case G:
            var r = e.render;
            return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case H:
            return r = e.displayName || null, r !== null ? r : c(e.type) || "Memo";
          case j:
            r = e._payload, e = e._init;
            try {
              return c(e(r));
            } catch {
            }
        }
      return null;
    }
    function m(e) {
      return "" + e;
    }
    function u(e) {
      try {
        m(e);
        var r = !1;
      } catch {
        r = !0;
      }
      if (r) {
        r = console;
        var t = r.error, n = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t.call(
          r,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          n
        ), m(e);
      }
    }
    function f(e) {
      if (e === T) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === j)
        return "<...>";
      try {
        var r = c(e);
        return r ? "<" + r + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function o() {
      var e = k.A;
      return e === null ? null : e.getOwner();
    }
    function i() {
      return Error("react-stack-top-frame");
    }
    function d(e) {
      if (N.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function p(e, r) {
      function t() {
        C || (C = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          r
        ));
      }
      t.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: t,
        configurable: !0
      });
    }
    function v() {
      var e = c(this.type);
      return I[e] || (I[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function g(e, r, t, n, h, A) {
      var a = t.ref;
      return e = {
        $$typeof: P,
        type: e,
        key: r,
        props: t,
        _owner: n
      }, (a !== void 0 ? a : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: v
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: h
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: A
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function l(e, r, t, n, h, A) {
      var a = r.children;
      if (a !== void 0)
        if (n)
          if (K(a)) {
            for (n = 0; n < a.length; n++)
              x(a[n]);
            Object.freeze && Object.freeze(a);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else x(a);
      if (N.call(r, "key")) {
        a = c(e);
        var _ = Object.keys(r).filter(function(ee) {
          return ee !== "key";
        });
        n = 0 < _.length ? "{key: someKey, " + _.join(": ..., ") + ": ...}" : "{key: someKey}", $[a + n] || (_ = 0 < _.length ? "{" + _.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          n,
          a,
          _,
          a
        ), $[a + n] = !0);
      }
      if (a = null, t !== void 0 && (u(t), a = "" + t), d(r) && (u(r.key), a = "" + r.key), "key" in r) {
        t = {};
        for (var O in r)
          O !== "key" && (t[O] = r[O]);
      } else t = r;
      return a && p(
        t,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), g(
        e,
        a,
        t,
        o(),
        h,
        A
      );
    }
    function x(e) {
      w(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === j && (e._payload.status === "fulfilled" ? w(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function w(e) {
      return typeof e == "object" && e !== null && e.$$typeof === P;
    }
    var R = re, P = Symbol.for("react.transitional.element"), M = Symbol.for("react.portal"), T = Symbol.for("react.fragment"), U = Symbol.for("react.strict_mode"), J = Symbol.for("react.profiler"), q = Symbol.for("react.consumer"), V = Symbol.for("react.context"), G = Symbol.for("react.forward_ref"), X = Symbol.for("react.suspense"), B = Symbol.for("react.suspense_list"), H = Symbol.for("react.memo"), j = Symbol.for("react.lazy"), Z = Symbol.for("react.activity"), Q = Symbol.for("react.client.reference"), k = R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, N = Object.prototype.hasOwnProperty, K = Array.isArray, S = console.createTask ? console.createTask : function() {
      return null;
    };
    R = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var C, I = {}, Y = R.react_stack_bottom_frame.bind(
      R,
      i
    )(), F = S(f(i)), $ = {};
    E.Fragment = T, E.jsx = function(e, r, t) {
      var n = 1e4 > k.recentlyCreatedOwnerStacks++;
      return l(
        e,
        r,
        t,
        !1,
        n ? Error("react-stack-top-frame") : Y,
        n ? S(f(e)) : F
      );
    }, E.jsxs = function(e, r, t) {
      var n = 1e4 > k.recentlyCreatedOwnerStacks++;
      return l(
        e,
        r,
        t,
        !0,
        n ? Error("react-stack-top-frame") : Y,
        n ? S(f(e)) : F
      );
    };
  })()), E;
}
var L;
function oe() {
  return L || (L = 1, process.env.NODE_ENV === "production" ? y.exports = ne() : y.exports = ae()), y.exports;
}
var s = oe();
const ie = ({
  apiBaseUrl: c = "http://127.0.0.1:8000",
  apiKey: m = "fairmatch-secret-key",
  jobId: u = "job_demo_01",
  themeColor: f = "#000000",
  onMatchComplete: o
}) => {
  const [i, d] = W([]), [p, v] = W(!1), g = async () => {
    v(!0);
    try {
      const x = await (await fetch(`${c}/api/v1/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": m
        },
        body: JSON.stringify({ job_id: u })
      })).json();
      x.results && (d(x.results), o && o(x));
    } catch (l) {
      console.error("Widget API match error:", l);
    } finally {
      v(!1);
    }
  };
  return te(() => {
    g();
  }, [u]), /* @__PURE__ */ s.jsxs("div", { style: {
    fontFamily: "'Inter', sans-serif",
    border: "1px solid #e4e4e7",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "#ffffff",
    maxWidth: "480px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  }, children: [
    /* @__PURE__ */ s.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }, children: [
      /* @__PURE__ */ s.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
        /* @__PURE__ */ s.jsx("div", { style: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: f } }),
        /* @__PURE__ */ s.jsx("span", { style: { fontWeight: 600, fontSize: "14px" }, children: "FairMatch Embedded Engine" })
      ] }),
      /* @__PURE__ */ s.jsx("span", { style: { fontSize: "10px", color: "#888", textTransform: "uppercase" }, children: "Audited & Explainable" })
    ] }),
    p ? /* @__PURE__ */ s.jsx("div", { style: { padding: "20px", textAlign: "center", fontSize: "13px", color: "#666" }, children: "Scoring Candidates with XGBoost & SHAP..." }) : i.length === 0 ? /* @__PURE__ */ s.jsx("div", { style: { padding: "20px", textAlign: "center", fontSize: "13px", color: "#666" }, children: "No match candidates scored yet." }) : /* @__PURE__ */ s.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: i.slice(0, 3).map((l) => /* @__PURE__ */ s.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 12px",
      backgroundColor: "#f9f9fb",
      borderRadius: "8px",
      border: "1px solid #eee"
    }, children: [
      /* @__PURE__ */ s.jsxs("div", { children: [
        /* @__PURE__ */ s.jsx("div", { style: { fontWeight: 600, fontSize: "13px", color: "#111" }, children: l.candidate_name }),
        /* @__PURE__ */ s.jsxs("div", { style: { fontSize: "11px", color: "#666" }, children: [
          "Skill Overlap: ",
          (l.skill_overlap * 100).toFixed(0),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ s.jsx("div", { style: {
        backgroundColor: f,
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 700
      }, children: l.final_score.toFixed(1) })
    ] }, l.resume_id)) })
  ] });
};
export {
  ie as FairMatchWidget,
  ie as default
};
