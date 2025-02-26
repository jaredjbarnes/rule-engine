* We need to make all reducing value async
* Add Services
    - [https://some-api.com/]({
        user-items[https://some-other-api.com](EVENT.user)
      })
    - As long as the api recieves json and returns json. 
* Emit
    - EMIT("EVENT_NAME", {})

This essentially will become the linear service bus. It will also protect
against circular rules executing with static anaylisis. 

All services will be glued together with linear rules. 

Use the 

[WHEN]
    - SALE & CHECKOUT
[IF] 
    - SALE.amount > 10
THEN
    - [https://discount.api.com/add-discount]({
        user: SALE.user,
        discountAmount: 0.2
        cart: [https://cart.com]({user:user})
    })


* Build an inspector that will show what the engine is current processing.

* Build in a Polling system

[WHEN] This is optional 
    - event
[START IF]
    - condition
REPEAT every 500ms
    - value = [https://api.com/value]({headers: {
        authorization: "Bearer " + [https://auth.com/tokens]({})
    }, body: {

    }})
    - EMIT("", )
[STOP IF]
    - condition

* Add array functions
 * first
 * last
 * [key]
 * forEach
 * length

* Add global context
 * GLOBAL 
 * GLOBAL.url - https://rules_engine.com/namespace-1
 * GLOBAL.tokens
 * 

* Note you can have many instances of the Rules Engine running 

https://rules_engine.com/namespace-1
https://rules_engine.com/namespace-2

This allows many contexts to be created

* Add id to Node

* Build debugger into system.
 * Within the async reducing we should add a check for breakpoints.
 * This would allow real time debugging.
 

* Build Execution Inspector
 * Use the node ids and record all values and what nodes are reduced to.

