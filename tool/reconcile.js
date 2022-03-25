function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  nextFiberReconcileWork = wipRoot;
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
