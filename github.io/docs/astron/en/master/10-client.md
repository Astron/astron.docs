Client Protocol
===============
**Authors**  
_Sam "CFSworks" Edwards (09-17-2013)_  
_Kevin "Kestred" Stenerson (10-08-2013)_  


## Section 0: Abstract ##

This document describes the protocol used by clients to communicate with an Astron
cluster. This should not be confused with the _internal protocol_, which is used
by Astron servers to communicate amongst themselves. Instead, the client
protocol is used by game clients (running on the players' computers) to communicate
with the Client Agent -- the gateway into the cluster. Because clients connect
to the Client Agent rather than directly into the Message Director, we will use
the terms "gameserver" and "Client Agent" interchangeably.

## Section 1: Basic messaging format ##

Unlike the internal protocol, the client protocol has a very simple messaging format.

    uint16 length;  // Length of the entire message, excluding the length tag
    uint16 msgtype; // 16-bit identifier indicating what type of message is being sent
    ...             // message-specific data

Like the internal protocol, all multibyte integers are sent little-endian.

## Section 2: Typical client session ##

The client communicates with the server over a standard TCP connection. When the
client first connects, it is expected to send a `CLIENT_HELLO` message. This
message includes the hash of the DC file(s) and a (game-specific) version string.
The Client Agent will disconnect the client if either value differs from the
Client Agent's value. This is to ensure that out-of-date clients do not accidentally
connect to the gameserver.

After the `CLIENT_HELLO` is accepted, the client is in an "unauthenticated" state.
In this state, the client can send messages to certain, pre-approved objects, but
cannot open interest or do anything else. The objects are not announced to the
client: the client is expected to know their IDs in advance.

The purpose of this mechanism is to allow the client to provide suitable authentication
to the gameserver cluster. The authentication mechanism is entirely up to the
game developer: Astron does not mandate any sort of authentication method.

Once the client proves its identity to the server (through the aforementioned
pre-approved objects), the server will unrestrict the client, allowing it full
access to the normal gameserver logic. The client may then open interests to
discover already-existing objects in client-specified locations. The client may
also send field updates on any object, provided the field is tagged clsend.

The client is also permitted to "own" objects. These are objects where the server
grants the client additional privileges on those objects. The client may send
fields marked as "ownsend", receive field updates for fields marked "ownrecv",
and change the location of the owned objects at will.

When the client wishes to disconnect, it may simply close the TCP session.

## Section 3: Client messages ##

These are the messages that the client and Client Agent may send between each other
in order to accomplish various normal game tasks.

**CLIENT_HELLO (1)**

    uint32 dc_hash, string version

> This is the first message a client may send. The dc_hash is a 32-bit hash value
> calculated from all fields/classes listed in the client's DC file. The version
> is an app/game-specific string that developers should change whenever they
> release a new client build. Both values are compared to the Client Agent's DC
> file hash and configured version string to ensure that the client is fully
> up-to-date. If the client is not up-to-date, it will be disconnected with
> a `CLIENT_EJECT`. If the client is up-to-date, the gameserver will send
> a `CLIENT_HELLO_RESP` to inform the client that it may proceed with its normal
> logic flow.


**CLIENT_HELLO_RESP (2)** `No arguments`
> This is sent by the Client Agent to the client when the client's `CLIENT_HELLO`
> is accepted.


**CLIENT_DISCONNECT (3)** `No arguments`
> This is sent by the client to the Client Agent to notify that it is going
> to close the connection.


**CLIENT_EJECT (4)**

    uint16 error_code, string reason

> This is sent by the Client Agent to the client when the client is being
> disconnected. The error_code and reason arguments provide some explanation as
> to why the client is being dropped from the game.


**CLIENT_HEARTBEAT (5)** `No arguments`
> The client should send this message on a regular interval. If the Client Agent
> does not receive a `CLIENT_HEARTBEAT` for a certain (configurable) amount of time,
> it will assume that the client has crashed and disconnect the client.


### Section 3.1: Client Object Messages ###

**CLIENT_ENTER_OBJECT_REQUIRED (142)**

    uint32 do_id, uint32 parent_id, uint32 zone_id, uint16 dclass_id, <REQUIRED>

**CLIENT_ENTER_OBJECT_REQUIRED_OTHER (143)**

    uint32 do_id, uint32 parent_id, uint32 zone_id, uint16 dclass_id, <REQUIRED>, <OTHER> 

> Inform the client of an object entering one of the client's interests.
>
> **Note:** This is analogous to the [StateServer](12-stateserver#section-2-2-object-visibility-messages)
>           `OBJECT_ENTER_LOCATION` messages.


**CLIENT_ENTER_OBJECT_REQUIRED_OWNER (172)**

    uint32 do_id, uint32 parent_id, uint32 zone_id, uint16 dclass_id, <REQUIRED>

**CLIENT_ENTER_OBJECT_REQUIRED_OTHER_OWNER (173)**

    uint32 do_id, uint32 parent_id, uint32 zone_id, uint16 dclass_id, <REQUIRED>, <OTHER>

> Inform the client of an object entering ownership of the client.
>
> This create message carries the additional semantic meaning that the object is
> "owned" by this client, so the client should generate an "ownerview" ("OV")
> perspective rather than its normal client perspective.
>
> The client will see this object even if it is not in interest (therefore,
> parent_id and zone_id aren't necessarily covered by one of the client's interests)
> and the client will receive all ownrecv field updates (but will only receive
> broadcast if the object is visible).
>
> _Note: This is analogous to `STATESERVER_OBJECT_ENTER_OWNER_*` in the
>        internal protocol._


**CLIENT_OBJECT_SET_FIELD (120)**

    uint32 do_id, uint16 field_id, <VALUE>

> This is sent either by the Client Agent or the client to issue a field update
> on a given object. The format of this message is analogous to 
> `STATESERVER_OBJECT_SET_FIELD` in the internal protocol.

**CLIENT_OBJECT_SET_FIELDS (121)**

    uint32 do_id, uint16 num_fields, [uint16 field_id, <VALUE>]*num_fields

> This is sent by the Client Agentto issue a field update on a given object.
> The format of this message is analogous to `STATESERVER_OBJECT_SET_FIELDS`
> in the internal protocol.

**CLIENT_OBJECT_LEAVING (132)**

    uint32 do_id

> This is sent by the Client Agent to let the client know that an object is
> leaving the client's visibility, either due to deletion, zone change, or
> dropped interest.


**CLIENT_OBJECT_LOCATION (140)**

    uint32 do_id, uint32 parent_id, uint32 zone_id

> When the server sends this, it is informing the client that an object is moving
> to another parent/zone that the client has interest in. If the object moves to a
> location that the client does not have interest in, the object is leaving the
> client's scope, and the server will therefore send a `CLIENT_OBJECT_LEAVING`
> instead.
>
> When the client sends this, it is requesting that the server move an object
> *that it owns* to a given parent/zone. If the object is not owned, the server
> will disconnect the client.


### Section 3.2: Client Interest Messages ###

**CLIENT_ADD_INTEREST (200)**  

    uint32 context, uint16 interest_id, uint32 parent_id, uint32 zone_id

> The client sends this to open an interest in a single zone within a parent.
> The server will respond by sending a CREATE for every object in the new zone,
> followed by a `CLIENT_DONE_INTEREST_RESP`.
>
> When the server sends this, it is informing the client of an interest added
> to the client by the server with `CLIENTAGENT_ADD_INTEREST`.

**CLIENT_ADD_INTEREST_MULTIPLE (201)**

    uint32 context, uint16 interest_id, uint32 parent_id,
    uint16 zone_count, [uint32 zone_id]*zone_count

> The client sends this to open an interest cotaining multiple zones within a
> single parent. The server will respond with a single DONE response after every
> object from every zone replies.
>
> When the server sends this, it is informing the client of an interest added
> to the client by the server with `CLIENTAGENT_ADD_INTEREST_MULTIPLE`.

**CLIENT_REMOVE_INTEREST (203)**

    uint32 context, uint16 interest_id

> Remove interest added via a prior `CLIENT_ADD_INTEREST`. The server will send
> `CLIENT_OBJECT_DISABLE`s for any objects that are no longer visible as a result,
> followed by a `CLIENT_DONE_INTEREST_RESP`. Objects that are still visible due to
> another, overlapping interest will be ignored.

**CLIENT_DONE_INTEREST_RESP (204)**

    uint32 context, uint16 interest_id

> Sent by the server to inform the client that an interest add/remove operation
> for the given interest has completed. The context is the same as the
> (client-chosen) context sent in the operation: this is to disambiguate
> interests that might reuse the same interest ID.
>
> _Note: If a shard containing children of the parent object crashed/crashes a
>        CLIENT_DONE_INTEREST_RESP may never be sent. As such a client should
>        stop blocking on it after a reasonable timeout. In some cases, it may be
>        acceptable or even preferred to not wait for the DONE_INTEREST_RESP at
>        all and just act on objects as they come in._


## Section 4: Disconnect reasons ##

This section lists out a few of the disconnect reasons that the Client Agent
may give in a `CLIENT_GO_GET_LOST` message, as well as a brief explanation for
each.

### Section 4.1: CA disconnect reasons ###

These are reasons sent by the Client Agent itself. As such, clients should be
prepared to receive them even if nothing else in the cluster uses these codes.

 * __106__ - The client sent an oversized datagram.
 * __107__ - The client's first message was not `CLIENT_HELLO`.
 * __108__ - The client sent an invalid msgtype.
 * __109__ - The client sent a truncated datagram.
 * __113__ - The client violated the rules of the anonymous sandbox.
 * __115__ - The client tried to send an unpermitted interest operation.
 * __117__ - The client tried to manipulate a nonexistent/unseen/unknown object ID.
 * __118__ - The client sent a `CLIENT_OBJECT_SET_FIELD` for a field they may not update.
 * __119__ - The client sent a `CLIENT_OBJECT_LOCATION` for an object they may not relocate.
 * __124__ - The client sent a `CLIENT_HELLO` with an invalid version string.
 * __125__ - The client sent a `CLIENT_HELLO` with an invalid DC hash.
 * __153__ - One of the client's "session objects" has been unexpectedly deleted.
 * __345__ - The client hasn't sent a `CLIENT_HEARTBEAT` for an extended period of time.
 * __347__ - The Client Agent had a network I/O error while trying to send a datagram.
 * __348__ - The Client Agent had a network I/O error while trying to read a datagram.

### Section 4.2: Generic Application reasons ###

The CA will not send these disconnect messages itself. They are entirely up to
the game developer to issue these codes via `CLIENTAGENT_DISCONNECT`. However,
we have reserved these codes for the convenience of game developers, as they may
be useful for certain games:

 * __100__ - Another client logged in on the same account elsewhere.
 * __122__ - Login issue; the login mechanism rejected the client's credentials.
 * __126__ - Administrative access violation; the client attempted to issue an administrator
command, but the gameserver did not authorize it.
 * __151__ - Client logged out by administrator command, not necessarily for rules violation.
 * __152__ - Client logged out (and possibly banned) by a moderator for rules violation.
 * __154__ - Gameserver is going down for maintenance.
