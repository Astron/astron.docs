DCFile Language Specification
=============================

<p class="alert alert-warning">
  **Warning:** This page is a work in progress and only describes comments in DCFiles.
  _Totally useful right?_
</p>

This is a reference manual for the DCFile distributed class description format.
It can and should be used as a reference to help understand the features and
concepts of the `.dc` file format. This reference is not arranged as a linear
tutorial, but rather as an overview of all features and concepts in DCFiles.

The `.dc` file format is intended to describe the objects that take part in
network and interprocess communication within a larger application.


--------------------------------------------------------------------------------


## Basic Lexical Elements

A `.dc` will often look fairly similar to a C++ header file that defines the
classes, structures, and methods of an application. The syntax and grammar of
the language are both very similar.

Like C/C++/Java, DCFiles use semicolons `;` to separate declarations onto their
own logical lines. Being an interface description language, a .dc file does not
have any statements, though certain declarations accept expressions -- primarily
to declare default values. Similarily, when defining a class or data-structure,
curly-braces `{ ... }` are used to delineate blocks.

### Comments

Comments in a .dc file are again in the style of C/C++/Java.

A `//` can be used to comment out the remainder of a line.

```dcf
// ie. a typical single-line comment
```

and the `/* ... */` recipe can be used for block-comments.

```dcf
/*
 * This is an example of a multi-line comment.
 *
   Note: the asterisk on each line is a stylistic choice in comments, not required.
 */
```

### Primitive Value Types

**TODO**


--------------------------------------------------------------------------------


## Structured Values

### Defining a Struct

### Fields


--------------------------------------------------------------------------------


## Classes

### Defining a Class

### Fields in CLasses

### Methods

### Molecular Fields


--------------------------------------------------------------------------------


## Typedefs


--------------------------------------------------------------------------------


## Keywords


--------------------------------------------------------------------------------


## Imports


--------------------------------------------------------------------------------


## Advanced Types

### Using arrays

### Limiting string and array sizes with ranges

### Limiting numerics with ranges

### Constraining numerics with modulus

### Using fixed-point fractional numbers
