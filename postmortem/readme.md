# On js1k 2015

Programmers doesn't like to write documentation, often they doesn't like to write anything except code.
But sharing the knowledge is everything and here's the (brief) postmortem on what I did during this year's JS1K.

It covers two entries, the [invitro](http://subzey.github.io/js1k2015invitro/) which I made with [@xem](https://github.com/xem)'s help and my very own compo entry, [Cosmic Railways](https://github.com/xem).

These two entries has something in common, something that is quite unusual for me as a golfer:
it was built from original source to "production" code completely automatically without touching a single byte "by hands" in between.

## Uber builder

Of course, that wasn't a regular grunt or gulp task. _(In fact, no task runners were involved at all.)_
That was just an ugly node.js script that nevertheless did its job well.

It's open source and [you can browse its code](https://github.com/subzey/js1k2015/blob/master/make.js).
You are even free to fork it and to use it in your own projects, but be warned: that's just a hacking tool that features really ugly code and wasn't intended to have some kind of documented public API (yet).

Here what it does, in the nutshell: Inline preprocession → UglifyJS2 → Var removal → RegPack → Templating.
I'll describe it here in reverse order, `pop`ping an abstraction layer once at a time.

### Templating

The most trivial one. Final code is inlined into JS1K shim, just to ensure everything works fine.
This year's shim differs from the previous ones.
Now you can't just change `<script>\\Entry code goes here</script>` into `<script src="entry.js"></script>` and work with pristine `entry.js` code. It just won't work _(or would it?)_.

So the actual development was made with 2014's shim hoping that everything works well in 2015's shim. And actually it does work well, I had no problem with it at all. But still, it's better to check twice.

The invitro was made (and released) with 2014's shim, just because nobody knew how 2015's shim would look like at that point.

### RegPack

Nowadays almost every JS1K entry is packed with awesome [RegPack](http://siorki.github.io/regPack.html) packer.
If we'd count the kudos, [Siorki](https://github.com/Siorki) probably is the champion.

The hard part is RegPack was a browser application. (Now, when I write these words, AFAIK, it already has node.js support.)
And I had to grab `require("vm")`and write an environment mimicking browser.
What was a boring part, mostly a debugging and stuffing code just to make it runnable.
And I had several unnoticed bugs, so the code packed with Node was bigger than the same packed in browser.

But the yield worths it. I saved a lot of time just by not copy-pasting code into Chrome page.
Also I could bruteforce the packing params (score/gain/length) and often it gave much better results than default "1, 0, 0".

There was some other fiddling:

#### Custom canvas context hashing

The "builtin" hashing copies ctx methods with shorter name. But it cannot deal with property setters. Assign `c.sS = 'red'` and js interpreter will just do nothing useful.

Here's an idea proposed by @xem and evolved (and implemented by me): long ctx property names can also be accessed via square braces. If we have variable, say, `sS` somewhere it the scope and it equals to `"strokeStyle"`, then `c[sS]` would work as a charm!

We can define a global variable accessing `window` (or `self`), but there's a mechanism that makes properties visible as a variables, and you know it. That's the `with` operator. So we just create an object and stuff properties there.
...or we pick an already existing object, `Math`, that already is treated specially and we're probably already using `with(Math)`. Then it's just up to picking a good hashing function, and that's it.

Yes, we're polluting a builtin object here. But that's a code golfing.

Note that this hashing scheme often results a bigger code. But sometimes (and invitro is exactly that case) it saves ~50 bytes.

#### setInterval unwinding

If we look at the genereated code, we'll see something like:

```javascript
/* blah-blah-blah */;eval(_)
```

`setInterval` evals its argument if it's a string. So if `_` contains only a one big `setInterval` call replace it with:

```javascript
/* blah-blah-blah */;setInterval(_, whatever)
```
where `_` is as `setInterval` body. There's a nuance, `with(Math) setInterval(...)` won't work as expected, but we can easily move `with` into interval body string.

This techinque was used both for the invitro and the entry. How to determine whether it's worth to use it? Good ol' bruteforce! :D

#### Var vemoval

