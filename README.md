# PostCSS Plugin Custom Primitives

[PostCSS] plugin that helps generating boring utilities.

[postcss]: https://github.com/postcss/postcss

```css
/* Input example */
@primitive margin {
    xx-small: var(--spacing--xx-small);
    x-small: var(--spacing--x-small);
    small: var(--spacing--small);
    medium: var(--spacing--medium);
    large: var(--spacing--large);
    x-large: var(--spacing--x-large);
    xx-large: var(--spacing--xx-large);
}
```

```css
/* Output example */
.has-margin\:xx-small {
    margin: var(--spacing--xx-small)
}
.has-margin\:x-small {
    margin: var(--spacing--x-small)
}
.has-margin\:small {
    margin: var(--spacing--small)
}
.has-margin\:medium {
    margin: var(--spacing--medium)
}
.has-margin\:large {
    margin: var(--spacing--large)
}
.has-margin\:x-large {
    margin: var(--spacing--x-large)
}
.has-margin\:xx-large {
    margin: var(--spacing--xx-large)
}
```

## Usage

Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-plugin-custom-primitives'),
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
