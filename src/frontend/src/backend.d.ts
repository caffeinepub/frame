import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Comment {
    id: bigint;
    resolved: boolean;
    createdAt: bigint;
    text: string;
    author: string;
    elementId: bigint;
}
export interface Position {
    x: number;
    y: number;
    z: number;
}
export interface Clash {
    id: bigint;
    resolved: boolean;
    element1Id: bigint;
    element2Id: bigint;
    clashType: ClashType;
    projectId: bigint;
    severity: ClashSeverity;
}
export interface Snapshot {
    id: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    projectId: bigint;
}
export interface Dimensions {
    height: number;
    width: number;
    depth: number;
}
export interface Project {
    id: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
}
export interface Element {
    id: bigint;
    discipline: Discipline;
    properties: string;
    projectId: bigint;
    position: Position;
    dimensions: Dimensions;
    elementType: ElementType;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface AnalysisResult {
    id: bigint;
    status: AnalysisStatus;
    governingCheck: string;
    utilizationRatio: number;
    elementId: bigint;
}
export enum AnalysisStatus {
    warning = "warning",
    fail = "fail",
    pass = "pass"
}
export enum ClashSeverity {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum ClashType {
    workflow = "workflow",
    hard = "hard",
    soft = "soft"
}
export enum Discipline {
    mep = "mep",
    structure = "structure",
    architecture = "architecture",
    partsAssemblies = "partsAssemblies"
}
export enum ElementType {
    floor = "floor",
    beam = "beam",
    door = "door",
    duct = "duct",
    pipe = "pipe",
    wall = "wall",
    window_ = "window",
    column = "column"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnalysisResult(elementId: bigint, utilizationRatio: number, governingCheck: string, status: AnalysisStatus): Promise<bigint>;
    addClash(projectId: bigint, element1Id: bigint, element2Id: bigint, clashType: ClashType, severity: ClashSeverity): Promise<bigint>;
    addComment(elementId: bigint, author: string, text: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createElement(projectId: bigint, elementType: ElementType, discipline: Discipline, properties: string, position: Position, dimensions: Dimensions): Promise<bigint>;
    createProject(name: string, description: string): Promise<bigint>;
    createSnapshot(projectId: bigint, name: string, description: string): Promise<bigint>;
    getAllElementsByProject(projectId: bigint): Promise<Array<Element>>;
    getAllProjects(): Promise<Array<Project>>;
    getAnalysesByElement(elementId: bigint): Promise<Array<AnalysisResult>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClashesByProject(projectId: bigint): Promise<Array<Clash>>;
    getCommentsByElement(elementId: bigint): Promise<Array<Comment>>;
    getElement(elementId: bigint): Promise<Element>;
    getProject(projectId: bigint): Promise<Project>;
    getSnapshotsByProject(projectId: bigint): Promise<Array<Snapshot>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    resolveClash(clashId: bigint): Promise<void>;
    resolveComment(commentId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(projectId: bigint, name: string, description: string): Promise<void>;
}
