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
If we'd count the kudos, [@Siorki](https://github.com/Siorki) probably is the champion.

The hard part is RegPack was a browser application. (Now, when I write these words, AFAIK, it already has node.js support.)
And I had to grab `require("vm")`and write an environment mimicking browser.
What was a boring part, mostly a debugging and stuffing code just to make it runnable.
And I had several unnoticed bugs, so the code packed with Node was bigger than the same packed in browser.

But the yield worths it. I saved a lot of time just by not copy-pasting code into Chrome page.
Also I could bruteforce the packing params (score/gain/length) and often it gave much better results than default "1, 0, 0".

There was some other fiddling:

#### Custom canvas context hashing

The "builtin" hashing copies ctx methods with shorter name. But it cannot deal with property setters. Assign `c.sS = 'red'` and js interpreter will just do nothing useful.

Here's an idea proposed by @xem and evolved by me: long ctx property names can also be accessed via square braces. If we have variable, say, `sS` somewhere it the scope and it equals to `"strokeStyle"`, then `c[sS]` would work as a charm!

We can define a global variable accessing `window` (or `self`), but there's a mechanism that makes properties visible as a variables, and you know it. That's the `with` operator. So we just create an object and stuff properties there.
...or we pick an already existing object, `Math`, that already is treated specially and we're probably already using `with(Math)`. Then it's just up to picking a good hashing function, and that's it.

Yes, we're polluting a builtin object here. But that's a code golfing.

Note that this hashing scheme often results a bigger code. But sometimes (and invitro is exactly that case) it saves ~50 bytes.

#### setInterval unwinding

If we look at the genereated code, we'll see something like:

```javascript
/* blah-blah-blah */;eval(_)
```

`setInterval` evals its argument if it's a string. So if `_` contains only a one big `setInterval` it can be replaced it with:

```javascript
/* blah-blah-blah */;setInterval(_, whatever)
```
where `_` is as `setInterval` body. There's a nuance, `with(Math) setInterval(...)` won't work as expected, but we can easily move `with` into interval body string.

This techinque was used both for the invitro and the entry. How to determine whether it's worth to use it? Good ol' bruteforce! :D

### Var removal

Pretty dumb regular expression removes `var` statements, so all variables are global and are defined by assignment.
Extra attention must be applied in order to avoid references to variables until it is assigned.

But if you're going to reuse variables, that's simple.
Here's my advice: declare all variables in global scope _(in code golf, of course, never do that in production!)_, and if you're going to reuse it, then give the names like `var1`, `v01`. This is the only way you can drop `var`'s safely.

### UglifyJS2

I've used automatic minifier for golfing puposes for the first time for js13kGames compo.
13 KiB zipped is about 70 KiB of raw code, that's almost as big as jquery.min.js.
Sure, golfing this manually is insanity.

I've found something interesting: UglifyJS and Closure Compiler performs very well for canvas drawing routines.

Let imagine, how to coerce value to integer? `Math.round(i)`, `i|0`, `i&i`, `i^NaN`, `+i.replace(/\..*/,'')`, lots of ways!

How can to draw a line on canvas? `c.lineTo(x,y)`. That's the end of the list.
You cannot even use `undefined` instead of 0.

UglifyJS is not an option for 140byt.es, but it's pretty good for js1k.

If you're using it right.

### Inline preprocession

#### Functions

There's a number of things that UglifyJS (or CC) cannot do.

First of all, functions. Although UglifyJS makes code optimized for DEFLATE (RegPack works in a similar way), it cannot fiddle with function signatures.
If we have a function with signature `(a, b, c)`, and the other, with `(a, b)`, we can change the last signature
to `(a, b, c)` as well. That's more bytes, but if would compress better. Uglify cannot do it.

The other thing Uglify lacks is treating functions as procedures, i.e., `return whatever`. _(Am I wrong? [Tweet me!](http://twitter.com/subzey/))_

I did nothing for solving that problems, just didn't use functions.

#### Constants

There one thing I made in builder. If variable name is all uppercase, it is chopped off from the source and all its entries in the code are replaced with its value.

_It is made with ugly RegExps and eval this time. I didn't like that code so much, I've started a new production level preprocession project, [Rhubarb](https://www.npmjs.com/package/rhubarb)._

#### Structure

The other feature I had to introduce is made for keeping code readable and editable.
If the variable name starts with `__inline_`, some magic happens and

```javascript
var __inline_clearHeight = v03 = Math.abs(80-animationState);
c.clearRect(-45, __inline_clearHeight, 90, -v03*2);
```

becomes

```javascript
c.clearRect(-45, v03 = Math.abs(80-animationState), 90, -v03*2);
```

That allowed me to fiddle with code and quickly check whether inlining saves bytes or not.

### Autobuild

Talking of fiddling, here's a bonus part. If you're going to create a some kind of builder, use a FS watcher.
It's awesome to move a line up or down and almost instantly know how much bytes were saved.
This is something I could never manage to do if I compress the code manually.

# Conclusion

Some can say that using automated stuff for code golf is lame, unfair or violates the demoscene spirit.

I don't think so. Code golf is all about exerсise for brain and having fun.
There's no challenge in doing obvious optimizations manually, but there is challenge and inspiration
in making computer do it for you, and making only minimal pinpoint "lowlevel" corrections where algorithm
is too dumb.

That's all. Thanks to everyone who read this, greets to all js1k participants (you did great, guys!) and, of course, kudos to @kuvos!

*Hey, that all was about the tool, what about the code itself? I'll write nothing, as you can read its source and nothing too special happens there :D*
