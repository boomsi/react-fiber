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
