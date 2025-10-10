import axios from "axios";
import type { Resource, ResourceFormData } from "./types";

// Base URL
// const API_BASE = "https://url.com/api/resources";

// fake data

let resources: Resource[] = [
  {
    resourceId: 1,
    departmentId: 101,
    name: "Medical Supplies",
    description: "First aid kits and medicines",
    quantity: 150,
    available: 120,
    resourceType: "Medical",
    image: "/images/first-aid-box.png",
  },
  {
    resourceId: 2,
    departmentId: 102,
    name: "Emergency Vehicles",
    description: "Ambulances and fire trucks",
    quantity: 25,
    available: 23,
    resourceType: "Vehicle",
    image: "/images/ambulance.png",
  },
  {
    resourceId: 3,
    departmentId: 103,
    name: "Personnel",
    description: "On-duty emergency staff",
    quantity: 50,
    available: 39,
    resourceType: "Human",
    image: "/images/response.png",
  },
];


export async function getResources(): Promise<Resource[]> {
  // const response = await axios.get(API_BASE);
  // return response.data;
  return Promise.resolve(resources);
}

export async function getResourceById(id: number): Promise<Resource | undefined> {
  // const response = await axios.get(`${API_BASE}/${id}`);
  // return response.data;
  return Promise.resolve(resources.find(r => r.resourceId === id));
}

export async function addResource(data: ResourceFormData): Promise<Resource> {
  // const response = await axios.post(API_BASE, data);
  // return response.data;

  const nextId = resources.reduce((m, r) => Math.max(m, r.resourceId), 0) + 1;
  const newResource: Resource = { resourceId: nextId, ...data };
  resources.push(newResource);
  return Promise.resolve(newResource);
}

export async function updateResource(updated: Resource): Promise<Resource> {
  // const response = await axios.put(`${API_BASE}/${updated.resourceId}`, updated);
  // return response.data;

  const idx = resources.findIndex(r => r.resourceId === updated.resourceId);
  if (idx === -1) throw new Error("Resource not found");
  resources[idx] = { ...updated };
  return Promise.resolve(updated);
}

export async function deleteResource(id: number): Promise<void> {
  // await axios.delete(`${API_BASE}/${id}`);

  const idx = resources.findIndex(r => r.resourceId === id);
  if (idx === -1) throw new Error("Resource not found");
  resources.splice(idx, 1);
  return Promise.resolve();
}
