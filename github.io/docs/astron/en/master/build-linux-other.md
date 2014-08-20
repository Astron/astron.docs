Building on Linux / Other
=========================

## Compiling

First read through [building astron from source](build-introduction.html), if you haven't done so
already, to set up Astron's build environment.

After setting up your environment you can compile with any of the following:

For release:

```sh
cmake -DCMAKE_BUILD_TYPE=Release . && make
```

For development (with Trace and Debug messages):

```sh
cmake -DCMAKE_BUILD_TYPE=Debug . && make
```

For development (without Trace and Debug messages):

```sh
cmake . && make
```


--------------------------------------------------------------------------------


## Building to Contribute

### Handling Build Artifacts

When contributing to the Astron repository or a branch you should not add build
artifacts to your commit.  Since build artifacts vary wildly between all the
operating systems and compilers that Astron will compile with, they are not
included in the `.gitignore` file.

Instead, edit the `.git/info/exclude` file for your local clone.

The following lines should be added for GNU Make on Linux:

```
astrond
*.[oa]
CMakeCache.txt
CMakeFiles/
cmake_install.cmake
Makefile
```
