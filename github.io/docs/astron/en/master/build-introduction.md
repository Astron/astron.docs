Building Astron from Source
===========================

This section explains how to compile Astron from source.

You will need to have a C++ compiler appropriate for your machine
(see [Supported Platforms](#supported-platforms) below).

Building Astron provides a couple benefits over installing it from a package:

1. Astron doesn't yet provide packages, so compiling it actually
   the _ONLY_ way to work with it.
2. Unused features can be compiled out to save space in ram and hopefully
   save space in the instruction cache.
3. Astron can be compiled with more (or less depending on your distribution)
   debug output.  Debug output is useful for development, but should be compiled
   out in production to see best performance.



## Prerequisites

### Download the Source

Astron is available on [GitHub](https://github.com/Astron/Astron) through Git.

Run this command locally:

```sh
git clone https://github.com/Astron/Astron.git
```

### Dependencies

Astron requires a compiler supporting most of the C++11 standard.

Astron also depends on a couple third party libraries:

 - boost 1.55+
 - libyaml-cpp 0.5+

Get the boost library from [here](http://www.boost.org/users/download/), or
install from a package on linux or OS X (with [Homebrew](http://brew.sh/).

In some environments Boost is not automatically detected, and you may have to
set the `BOOST_ROOT` environment variable as the root directory of your compiled
or packaged boost libraries.

Newer versions of Linux (or Homebrew) may have a libyaml-cpp 0.5+ available as
a package; otherwise, you can download the libyaml-cpp dependency directly from



## Compiling

### Configure Astron

Astron uses CMake to handle cross-platform compiling.

Compile-option documention is still [in-progress](. Using CMake GUI is the other
easiest way to see the available compile options with descriptions of what they
do. Astron tries to use intelligent defaults, so if you are just beginning with
Astron let CMake choose smart default values and should compile fine.

### Supported Platforms

 - [Linux / Make](build-linux-other.html)
 - [Windows / Visual Studio](build-windows.html)
