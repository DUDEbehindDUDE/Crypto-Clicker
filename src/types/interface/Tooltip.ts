export interface IDescriptionTooltip {
  element: React.JSX.Element,
  title: string,
  additionalContent: string[],
  placement?: string,
}

export interface IStoreItemTooltip {
  element: React.JSX.Element,
  mainItem: any,
  additionalContent: string[],
}