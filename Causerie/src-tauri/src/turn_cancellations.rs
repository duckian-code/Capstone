use std::{
    collections::HashMap,
    future::Future,
    sync::{LazyLock, Mutex},
};

use futures::future::{AbortHandle, Abortable};

use crate::{database, CommandError};

type TurnKey = (String, String);

// some(handle) running request
// none: cancellation arrived before req registered
static REQUESTS: LazyLock<Mutex<HashMap<TurnKey, Option<AbortHandle>>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

