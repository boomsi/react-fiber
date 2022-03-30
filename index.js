function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };

}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 当前处理到的 fiber 和根 fiber
let nextFiberReconcileWork = null;
let wipRoot = null;


/** schedule */

function workloop(deadline) {
  // 有空闲时间 且 存在下一个 fiber，执行下一个vdom转fiber的 reconcile
  let shouldYield = false;
  while (nextFiberReconcileWork && !shouldYield) {
    nextFiberReconcileWork = performNextWork(nextFiberReconcileWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextFiberReconcileWork) {
    commitRoot();
    return;
  }

  // do xxx
  requestIdleCallback(workloop);
}
requestIdleCallback(workloop);


/** reconcile */

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  console.log(wipRoot)

  nextFiberReconcileWork = wipRoot;
}

function performNextWork(fiber) {
  reconcile(fiber);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}

// vdom => fiber
function reconcile(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // dom => fiber
  reconcileChildren(fiber, fiber.props.children);
}


// dom => 子节点 => fiber
// wipFiber.child => fiber1.sibling => fiber2.sibling => fiber3
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let preSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    let newFiber = {
      type: element.type,
      props: element.props,
      dom: null,
      return: wipFiber,
      effectTag: "PLACEMENT",
    };

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      preSibling.sibling = newFiber;
    }

    preSibling = newFiber;
    index++;
  }
}

function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.return;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.return;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}


function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  for (const prop in fiber.props) {
    setAttribute(dom, prop, fiber.props[prop]);
  }

  return dom;
}

function isEventListenerAttr(key, value) {
  return typeof value === "function" && key.startsWith("on");
}

function isStyleAttr(key, value) {
  return key === "style" && typeof value === "object";
}

function isPlainAttr(key, value) {
  return typeof value !== "object" && typeof value !== "function";
}

function setAttribute(dom, key, value) {
  if (key === "children") {
    return;
  }

  if (key === "nodeValue") {
    dom.textContent = value;
  } else if (isEventListenerAttr(key, value)) {
    const eventType = key.slice(2).toLowerCase();
    dom.addEventListener(eventType, value);
  } else if (isStyleAttr(key, value)) {
    Object.assign(dom.style, value);
  } else if (isPlainAttr(key, value)) {
    dom.setAttribute(key, value);
  }
}


const Dong = {
  createElement,
  render
};
