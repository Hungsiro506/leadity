### Tracking with posthog:

This journey is a funnel :

from anonymous landing to homepage
fill the need with compare current loan or new loan
follow the sample flow in flow 1


i want to track :
- the event user click in each steps
event:
- visited ( when landing to homepage )
- compare_new_loan ( flow 2 )
- compare_own_load ( flow 1 )
	- current_loan_input
	- current_loan_early_input
	- indentified ( information put in and otp verified )
	- select loan option 




## Posthog docs:




## Installation

### Option 1: Add the JavaScript snippet to your HTML Recommended

This is the simplest way to get PostHog up and running. It only takes a few minutes.

Copy the snippet below and replace `<ph_project_api_key>` and `<ph_client_api_host>` with your project's values, then add it within the `<head>` tags at the base of your product - ideally just before the closing `</head>` tag. This ensures PostHog loads on any page users visit.

You can find the snippet pre-filled with this data in [your project settings](https://us.posthog.com/settings/project#snippet).

HTML

`   <script>      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);      posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY',{api_host:'https://us.i.posthog.com', defaults:'2025-05-24'})  </script>   `

Once the snippet is added, PostHog automatically captures `$pageview` and [other events](https://posthog.com/docs/data/autocapture) like button clicks. You can then enable other products, such as session replays, within [your project settings](https://us.posthog.com/settings).

  
Set up a reverse proxy (recommended)

[](https://posthog.com/docs/advanced/proxy)

[](https://posthog.com/docs/advanced/proxy/managed-reverse-proxy)

[](https://posthog.com/docs/advanced/proxy/cloudflare)[](https://posthog.com/docs/advanced/proxy/cloudfront)[](https://posthog.com/docs/advanced/proxy/vercel)

Grouping products in one project (recommended)

[](https://posthog.com/docs/settings/projects)

Include ES5 support (optional)

Working with AI code editors?

### Option 2: Install via package manager

npmYarnpnpmBun

`   npm install --save posthog-js   `

And then include it with your project API key and host (which you can find in [your project settings](https://us.posthog.com/settings/project)):

Web

`   import posthog from 'posthog-js'  posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {    api_host: 'https://us.i.posthog.com',    defaults: '2025-05-24'  })   `

See our framework specific docs for [Next.js](https://posthog.com/docs/libraries/next-js), [React](https://posthog.com/docs/libraries/react), [Vue](https://posthog.com/docs/libraries/vue-js), [Angular](https://posthog.com/docs/libraries/angular), [Astro](https://posthog.com/docs/libraries/astro), [Remix](https://posthog.com/docs/libraries/remix), and [Svelte](https://posthog.com/docs/libraries/svelte) for more installation details.

Bundle all required extensions (advanced)

- [](https://posthog.com/tutorials/electron-analytics)

Don't want to send test data while developing?

What is the `defaults` option?

Once you've installed PostHog, see our [features doc](https://posthog.com/docs/libraries/js/features) for more information about what you can do with it.

### Track across marketing website & app

We recommend putting PostHog both on your homepage and your application if applicable. That means you'll be able to follow a user from the moment they come onto your website, all the way through signup and actually using your product.

> PostHog automatically sets a cross-domain cookie, so if your website is `yourapp.com` and your app is on `app.yourapp.com` users will be followed when they go from one to the other. See our tutorial on [cross-website tracking](https://posthog.com/tutorials/cross-domain-tracking) if you need to track users across different domains.

### Replay triggers

You can configure "replay triggers" in your [project settings](https://app.posthog.com/project/settings). You can configure triggers to enable or pause session recording when the user visit a page that matches the URL(s) you configure.

You are also able to setup "event triggers". Session recording will be started immediately before PostHog queues any of these events to be sent to the backend.

## Opt out of data capture

You can completely opt-out users from data capture. To do this, there are two options:

1. Opt users out by default by setting `opt_out_capturing_by_default` to `true` in your [PostHog config](https://posthog.com/docs/libraries/js/config).

Web

`   posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {      opt_out_capturing_by_default: true,  });   `

2. Opt users out on a per-person basis by calling `posthog.opt_out_capturing()`.

Similarly, you can opt users in:

Web

`   posthog.opt_in_capturing()   `

To check if a user is opted out:

Web

`   posthog.has_opted_out_capturing()   `

## Running more than one instance of PostHog at the same time

While not a first-class citizen, PostHog allows you to run more than one instance of PostHog at the same time if you, for example, want to track different events in different posthog instances/projects.

`posthog.init` accepts a third parameter that can be used to create named instances.

TypeScript

`   posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {}, 'project1')  posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {}, 'project2')   `

You can then call these different instances by accessing it on the global `posthog` object

TypeScript

`   posthog.project1.capture("some_event")  posthog.project2.capture("other_event")   `

> **Note:** You'll probably want to disable autocapture (and some other events) to avoid them from being sent to both instances. Check all of our [config options](https://posthog.com/docs/libraries/js/config) to better understand that.

## Debugging

To see all the data that is being sent to PostHog, you can run `posthog.debug()` in your dev console or set the `debug` option to `true` in the `init` call. You can also enable debug mode by appending this query to the URL `?__posthog_debug=true` (i.e., [https://posthog.com/?__posthog_debug=true](https://posthog.com/?__posthog_debug=true)).

### Exposing the `posthog` global object in web apps that don't have `window.posthog`

> This has been tested in Chrome and Firefox. Safari doesn't have this feature, but other Chromium and Gecko/Firefox browsers do.

Sometimes you may want to test PostHog in the browser by using `posthog.capture()` or some other method. Although some sites expose `window.posthog`, most modern web app (React, Vue, etc.) don't.

To expose PostHog in the browser:

1. Enable debug mode by setting `debug: true` in your config
2. In the browser console, search for `[PostHog.js] Starting in debug mode`
3. Expand the object
4. Right-click on `this` and pick "Store as global variable"

You can then access `posthog` as `temp0` in Firefox and `temp1` in Chrome. You can then do stuff like `temp1.capture('test event')`.

## Development

For instructions on how to run `posthog-js` locally and setup your development environment, please checkout the README on the [posthog-js](https://github.com/PostHog/posthog-js#README) repository.




# JavaScript Web features

Last updated: Jul 09, 2025

|[Edit this page](https://github.com/PostHog/posthog.com/tree/master/contents/docs/libraries/js/features.mdx)|

Copy page

## Capturing events

By default, PostHog automatically captures pageviews and pageleaves as well as clicks, change of inputs, and form submissions associated with `a`, `button`, `form`, `input`, `select`, `textarea`, and `label` tags. See our [autocapture docs](https://posthog.com/docs/product-analytics/autocapture) for more details on this.

If you prefer to disable or filter these, set the appropriate values in your [configuration options](https://posthog.com/docs/libraries/js/config).

### Custom event capture

You can send custom events using `capture`:

Web

`   posthog.capture('user_signed_up');   `

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a [properties](https://posthog.com/docs/data/events#event-properties) object:

Web

`   posthog.capture('user_signed_up', {      login_type: "email",      is_free_trial: true  })   `

## Anonymous and identified events

PostHog captures two types of events: [**anonymous** and **identified**](https://posthog.com/docs/data/anonymous-vs-identified-events)

**Identified events** enable you to attribute events to specific users, and attach [person properties](https://posthog.com/docs/product-analytics/person-properties). They're best suited for logged-in users.

Scenarios where you want to capture identified events are:

- Tracking logged-in users in B2B and B2C SaaS apps
- Doing user segmented product analysis
- Growth and marketing teams wanting to analyze the _complete_ conversion lifecycle

**Anonymous events** are events without individually identifiable data. They're best suited for [web analytics](https://posthog.com/docs/web-analytics) or apps where users aren't logged in.

Scenarios where you want to capture anonymous events are:

- Tracking a marketing website
- Content-focused sites
- B2C apps where users don't sign up or log in

Under the hood, the key difference between identified and anonymous events is that for identified events we create a [person profile](https://posthog.com/docs/data/persons) for the user, whereas for anonymous events we do not.

> **Important:** Due to the reduced cost of processing them, anonymous events can be up to 4x cheaper than identified ones, so we recommended you only capture identified events when needed.

### Capturing anonymous events

The JavaScript Web SDK captures anonymous events by default. However, this may change depending on your [`person_profiles` config](https://posthog.com/docs/libraries/js/config) when initializing PostHog:

1. `person_profiles: 'identified_only'` _(recommended)_ _(default)_ - Anonymous events are captured by default. PostHog only captures identified events for users where [person profiles](https://posthog.com/docs/data/persons) have already been created.
    
2. `person_profiles: 'always'` - Capture identified events for all events.
    

For example:

Web

`   posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {      api_host: 'https://us.i.posthog.com',      defaults: '2025-05-24',      person_profiles: 'always'  })   `

### Capturing identified events

If you've set the [`personProfiles` config](https://posthog.com/docs/libraries/js/config) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. To capture identified events, call any of the following functions:

- [`identify()`](https://posthog.com/docs/product-analytics/identify)
- [`alias()`](https://posthog.com/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](https://posthog.com/docs/product-analytics/group-analytics)
- [`setPersonProperties()`](https://posthog.com/docs/product-analytics/person-properties)
- [`setPersonPropertiesForFlags()`](https://posthog.com/docs/libraries/js/features#overriding-server-properties)
- [`setGroupPropertiesForFlags()`](https://posthog.com/docs/libraries/js/features#overriding-server-properties)

When you call any of these functions, it creates a [person profile](https://posthog.com/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.

#### Identifying users

The most useful of these methods is `identify`. We strongly recommend reading our doc on [identifying users](https://posthog.com/docs/product-analytics/identify) to better understand how to correctly use it.

Using `identify`, you can capture identified events associated with specific users. This enables you to understand how they're using your product across different sessions, devices, and platforms.

Web

`   posthog.identify(      'distinct_id', // Required. Replace 'distinct_id' with your user's unique identifier      { email: 'max@hedgehogmail.com', name: 'Max Hedgehog' },  // $set, optional      { first_visited_url: '/blog' } // $set_once, optional  );   `

Calling `identify` creates a person profile if one doesn't exist already. This means all events for that distinct ID count as identified events.

You can get the distinct ID of the current user by calling `posthog.get_distinct_id()`.

## Setting person properties

To set [person properties](https://posthog.com/docs/data/user-properties) in these profiles, include them when capturing an event:

Web

`   posthog.capture(    'event_name',    {      $set: { name: 'Max Hedgehog'  },      $set_once: { initial_url: '/blog' },    }  )   `

Typically, person properties are set when an event occurs like `user updated email` but there may be occasions where you want to set person properties as its own event.

JavaScript

``   posthog.setPersonProperties(    { name: "Max Hedgehog" }, // These properties are like the `$set` from above    { initial_url: "/blog" }  // These properties are like the `$set_once` from above  )   ``

This creates a special `$set` event that is sent to PostHog. For more details on the difference between `$set` and `$set_once`, see our [person properties docs](https://posthog.com/docs/data/user-properties#what-is-the-difference-between-set-and-set_once).

## Resetting a user

If a user logs out or switches accounts, you should call `reset` to unlink any future events made on that device with that user. This prevents multiple users from being grouped together due to shared cookies between sessions. **We recommend you call `reset` on logout even if you don't expect users to share a computer.**

You can do that like so:

Web

`   posthog.reset()   `

If you _also_ want to reset `device_id`, you can pass `true` as a parameter:

Web

`   posthog.reset(true)   `

This also resets group analytics.


# JavaScript Web configuration

Last updated: Jul 23, 2025

|[Edit this page](https://github.com/PostHog/posthog.com/tree/master/contents/docs/libraries/js/config.mdx)|

Copy page

When calling `posthog.init`, there are various configuration options you can set to customize and control the behavior of PostHog.

To configure these options, pass them as an object to the `posthog.init` call, like we do with `api_host`, `defaults`, `loaded`, and `autocapture` below.

TypeScript

`   posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {      api_host: 'https://us.i.posthog.com',      defaults: '2025-05-24',      loaded: function (posthog) {          posthog.identify('[user unique id]')      },      autocapture: false,      // ... more options  })   `

You can also use the `posthog.set_config` method to change the configuration after initialization.

TypeScript

`   posthog.set_config({    persistence: 'localStorage+cookie',  })   `

There are many configuration options, most of which you do not have to ever worry about. For brevity, only the most relevant ones are used here. However you can view all the configuration options in `types.ts` file of the [SDK's source code](https://github.com/PostHog/posthog-js/blob/main/packages/browser/src/types.ts).

Some of the most relevant options are:

|Attribute|Description|
|---|---|
|`api_host`  <br>  <br>**Type:** String  <br>**Default:** `https://us.i.posthog.com`|URL of your PostHog instance.|
|`ui_host`  <br>  <br>**Type:** String  <br>**Default:** undefined|If using a [reverse proxy](https://posthog.com/docs/advanced/proxy) for `api_host` then this should be the actual PostHog app URL (e.g. `https://us.posthog.com`). This ensures that links to PostHog point to the correct host.|
|`autocapture`  <br>  <br>**Type:** Boolean or AutocaptureConfig  <br>**Default:** `true`|Determines if PostHog should [autocapture](https://posthog.com/docs/product-analytics/autocapture) events. This setting does not affect capturing pageview events (see `capture_pageview`). [See below for `AutocaptureConfig`](https://posthog.com/docs/libraries/js/config#configuring-autocapture)|
|`before_send`  <br>  <br>**Type:** Function  <br>**Default:** `function () {}`|A function that allows you to amend or reject events before they are sent to PostHog. [See below for more information](https://posthog.com/docs/libraries/js/features#amending-or-sampling-events)|
|`bootstrap`  <br>  <br>**Type:** Object  <br>**Default:** `{}`|An object containing the `distinctID`, `isIdentifiedID`, and `featureFlags` keys, where `distinctID` is a string, and `featureFlags` is an object of key-value pairs|
|`capture_pageview`  <br>  <br>**Type:** Boolean or String  <br>**Default:** `true`|Determines if PostHog should automatically capture pageview events. The default is to capture using page load events. If the special string `history_change` is provided, PostHog will capture pageviews based on path changes by listening to the browser's history API which is useful for single page apps. `history_change` is the default if you choose to set `defaults: '2025-05-24'` or later.|
|`capture_pageleave`  <br>  <br>**Type:** Boolean  <br>**Default:** `true`|Determines if PostHog should automatically capture pageleave events.|
|`capture_dead_clicks`  <br>  <br>**Type:** Boolean  <br>**Default:** `true`|Determines if PostHog should automatically capture dead click events.|
|`cross_subdomain_cookie`  <br>  <br>**Type:** Boolean  <br>**Default:** `true`|Determines if cookie should be set on the top level domain (example.com). If `posthog-js` is loaded on a subdomain (`test.example.com`), _and_ `cross_subdomain_cookie` is set to false, it'll set the cookie on the subdomain only (`test.example.com`).|
|[`custom_blocked_useragents`](https://posthog.com/docs/libraries/js/features#blocking-bad-actors)  <br>  <br>**Type:** Array  <br>**Default:** `[]`|A list of user agents to block when sending events.|
|`defaults`  <br>  <br>**Type:** String  <br>**Default:** `unset`|Whether we should use the most recent set of defaults or the legacy ones. Will use the legacy ones by default, set to `'<ph_posthog_js_defaults>'` to use the most recent defaults.|
|`disable_persistence`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Disable persisting user data across pages. This will disable cookies, session storage and local storage.|
|`disable_surveys`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Determines if surveys script should load which controls whether they show up for users, and whether requests for API surveys return valid data|
|`disable_session_recording`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Determines if users should be opted out of session recording.|
|`enable_recording_console_log`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Determines if console logs should be recorded as part of the session recording. [More information](https://posthog.com/docs/session-replay/manual#console-logs-recording).|
|`enable_heatmaps`  <br>  <br>**Type:** Boolean  <br>**Default:** undefined|Determines if heatmap data should be captured.|
|`loaded`  <br>  <br>**Type:** Function  <br>**Default:** `function () {}`|A function to be called once the PostHog scripts have loaded successfully.|
|`mask_all_text`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Prevent PostHog autocapture from capturing any text from your elements.|
|`mask_all_element_attributes`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Prevent PostHog autocapture from capturing any attributes from your elements.|
|`opt_out_capturing_by_default`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Determines if users should be opted out of PostHog tracking by default, requiring additional logic to opt them into capturing by calling `posthog.opt_in_capturing`.|
|`opt_out_persistence_by_default`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|Determines if users should be opted out of browser data storage by this PostHog instance by default, requiring additional logic to opt them into capturing by calling `posthog.opt_in_capturing`.|
|`persistence`  <br>  <br>**Type:** Enum: `localStorage`, `sessionStorage`, `cookie`, `memory`, or `localStorage+cookie`  <br>**Default:** `localStorage+cookie`|Determines how PostHog stores information about the user. See [persistence](https://posthog.com/docs/libraries/js/persistence) for details.|
|`property_denylist`  <br>  <br>**Type:** Array  <br>**Default:** `[]`|A list of properties that should never be sent with `capture` calls.|
|`person_profiles`  <br>  <br>**Type:** Enum: `always`, `identified_only`  <br>**Default:** `identified_only`|Set whether events should capture identified events and process person profiles|
|`rate_limiting`  <br>  <br>**Type:** Object  <br>**Default:** `{ events_per_second: 10, events_burst_limit: events_per_second * 10 }`|Controls event rate limiting to help you avoid accidentally sending too many events. `events_per_second` determines how many events can be sent per second on average (default: 10). `events_burst_limit` sets the maximum events that can be sent at once (default: 10 times the `events_per_second` value).|
|`session_recording`  <br>  <br>**Type:** Object  <br>**Default:** [See here.](https://github.com/PostHog/posthog-js/blob/96fa9339b9c553a1c69ec5db9d282f31a65a1c25/src/posthog-core.js#L1032)|Configuration options for recordings. More details [found here](https://posthog.com/docs/session-replay/manual)|
|`session_idle_timeout_seconds`  <br>  <br>**Type:** Integer  <br>**Default:** `1800`|The maximum amount of time a session can be inactive before it is split into a new session.|
|`xhr_headers`  <br>  <br>**Type:** Object  <br>**Default:** `{}`|Any additional headers you wish to pass with the XHR requests to the PostHog API.|

## Configuring autocapture

The `autocapture` config takes an object providing full control of autocapture's behavior.

|Attribute|Description|
|---|---|
|`url_allowlist`  <br>  <br>**Type:** Array of Strings or Regexp  <br>**Default:** `undefined`|List of URLs to enable autocapture on, can be string or regex matches e.g. `['https://example.com', 'test.com/.*']`. An empty list means no URLs are allowed for capture, `undefined` means all URLs are.|
|`dom_event_allowlist`  <br>  <br>**Type:** Array of Strings  <br>**Default:** `undefined`|An array of DOM events, like **click**, **change**, **submit**, to enable autocapture on. An empty array means no events are enable for capture, `undefined` means all are.|
|`element_allowlist`  <br>  <br>**Type:** Array of Strings  <br>**Default:** `undefined`|An array of DOM elements, like **a**, **button**, **form**, **input**, **select**, **textarea**, or **label** to allow autocapture on. An empty array means no elements are enabled for capture, `undefined` means all elements are enabled.|
|`css_selector_allowlist`  <br>  <br>**Type:** Array of Strings  <br>**Default:** `undefined`|An array of CSS selectors to enable autocapture on. An empty array means no CSS selectors are allowed for capture, `undefined` means all CSS selectors are.|
|`element_attribute_ignorelist`  <br>  <br>**Type:** Array of Strings  <br>**Default:** `undefined`|An array of element attributes that autocapture will not capture. Both an empty array and `undefined` mean any of the attributes from the element are captured.|
|`capture_copied_text`  <br>  <br>**Type:** Boolean  <br>**Default:** `false`|When set to true, autocapture will capture the text of any element that is cut or copied.|