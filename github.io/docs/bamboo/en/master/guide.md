Developer's Guide to Bamboo
===========================

<p class="alert alert-warning">
  **Warning:** Its probably not worth reading this page yet.  
  <br />
  Its older, _really_ wordy, written for a different website, and generally isn't
  well organized or paced.  
  <br />
  Really its just lorem-ipsum from the **mildly useful documentation** ipsum-generator.
</p>

Welcome to the developer documentation for bamboo – a library for distributed
apps to communicate using "objects" instead of messages.

This documentation is aimed at C++ and Python developers who want to use objects
to communicate in their distributed applications This overview introduces
distributed objects in bamboo and tells you what you need to do to get started.

API [reference documentation](/404.html) is also provided for both languages,
as well as [language](/404.html) and [style](/404.html) guides for writing
`.dc` files.


## How do I use Bamboo?

There are two major ways to use bamboo:

1. Classes can be dynamically defined and objects can be dynamically represented.
2. ~~Classes can be defined in a language-agnostic file and compiled into a language-native class.~~
   - the compiler hasn't been written yet, sorry :(

In your distributed application, you can choose to use either method exclusively
or use both in tandem in different components.

The dynamic tools are most useful to develop components of your system that are
agnostic to the actual data or method being processed; it may also be useful to
allowing you to modify the functioning of your system at runtime through the
reflection bamboo provides for distributed classes (allowing introspection and
modification of classes in a module).

The compiled version of the protocol is useful to define distributed objects
language-agnostically to be used across multiple components of an application
that could easily be written in different languages (currently only C++ and
Python, we'll add more bindings soon), which also allows easy communication with
any applications that work with dynamical class library.


--------------------------------------------------------------------------------


## Working with dynamically-defined classes

### What are Distributed Classes?

A distributed class is a named set of methods and fields that are intended to be
accessible between multiple components of a distributed application.
A distributed class could be defined as the interface for a set of remote
procedure calls; as a structured blob of data to send between applications; or
to be used in more traditional method as template that can be instantiated to
create an object and share its functioning across the network.

To represent a more simple object which is primarily just a container for data,
bamboo also provides an interface for Distributed Structs.

### How do they work?

Distributed classes can be defined in files and loaded into a process, or
created programtically at runtime.  _A loaded class can still be modified after
it is read from a file, so it is possible to mix both methods._

Here is a basic example of a class defined in the .dc file format.

```
dclass Account {
    /* Some basic fields */
    string username;
    string email;

    Account(string username, string email = ""); // optionally, a constructor
    authenticate(blob password, uint32 nonce); // a method
};
```

For those familiar with C-like syntax, this might seem pretty similar. A class
is given a name and contain any number of declared fields and methods. A field
always has a type and in a dclass will also always have a name (note: it is
possible to delcare structs with anonymous fields). A method has a name followed
by any number of arguments. No implementation for any of the methods is provided,
the dclass just defines the interface that two processes can use to interact
with eachother's objects.

Once you've defined a class in a file, bamboo can be used to read the file into memory and provide reflection on the classes that the file describes. Distributed classes are grouped in a logical unit called a Module. A module contains all the classes which define the interface for a particular application-space, for example: you may have a "DatabaseService" module which defines the interaction of an application which a remote database, a "Client" module defining the interactions of the client with the front-facing server, or have imported someone else's API module to make remote calls to an external service. Many applications will only need one module, like in the case of a networked game where all classes are intended to be part of the same system.

We can load a module in to memory and begin inspecting like the following:

@StartMultipleCodeblocks

```c++
#include <bamboo/module/Module.h>
#include <bamboo/dcfile/parse.h>

void main() {
    using bamboo;
    Module mod = read_dcfile("/path/to/module.dc");

    // Now lets inspect the module
    printf("Num classes %d", mod.get_num_classes); // prints "1" for the above example

    /*
    Class *foo = mod.get_class(0);
    Class *bar = mod.get_class_by_name("Account");
    printf("Is foo == bar? %s", (foo == bar) ? "true" : "false"); // prints "true"
    */
}
```

```python
# Note: The python API allows both camelCaseNames and slugified_names for function names.
from bamboo import dcfile
mod = dcfile.readDCFile("/path/to/module.dc");

# Now lets inspect the module
print mod.getNumClasses()  # prints "1" for the above example
foo = mod.getClass(0)
bar = mod.getClassByName("Account")
print foo is bar  # prints "true"
```

@EndMultipleCodeblocks


--------------------------------------------------------------------------------


## Working with compiled classes

### What are Distributed Objects?

A distributed object is like any other normal object in your C++ or Python
application: it has methods and fields and is represented by a normal object in
your language. The difference, is that a distributed object inherits from the
DistributedObject interface which is a lightweight interface that bamboo makes
easy to pack up and synchronzie with the rest of your application.

### How do they work?

At the moment, Distributed Objects really don't work. Applications which want to
interact with another bamboo application this way must custom-write alot of the
code to utilize classes defined in the library (see Astron and libastron for
examples of this being done).

Typically objects would have a local interface that a process uses to interface
with the object and allows it to run logic and make permutations before it would
likely automatically call a network interface to synchronize the changes across
the distributed application.

As bamboo approaches version 1.0, a major goal is to have a compiler or templater
allowing distributed class definitions to be compiled or hookable into
language-specific classes for easy use in a fast-running application.
