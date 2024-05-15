export type WorkflowInput = {
  productType: "Book" | "Beverage" | "Alcohol" | "QuasiDrug" | "Newspaper" | "Medicine" | "Other" | "Food",
  isOralProduct: boolean,
  serviceType: "TakeOut" | "EatIn",
  deliveryMethod: "Catering" | "Delivery" | "InternetDelivery",
  deliveryTo: "House" | "NursingHome" | "Apartment" | "NoPlace",
  price: number,
}

export type WorkflowInputs = WorkflowInput[];