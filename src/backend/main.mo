import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  ///////////////////
  // Types
  //////////////////
  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text; // "owner", "editor", "reviewer", "viewer"
  };

  type Project = {
    id : Nat;
    name : Text;
    description : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Element = {
    id : Nat;
    projectId : Nat;
    elementType : ElementType;
    discipline : Discipline;
    properties : Text; // JSON string
    position : Position;
    dimensions : Dimensions;
  };

  module Element {
    public func compare(e1 : Element, e2 : Element) : Order.Order {
      Nat.compare(e1.id, e2.id);
    };
  };

  type Position = {
    x : Float;
    y : Float;
    z : Float;
  };

  type Dimensions = {
    width : Float;
    height : Float;
    depth : Float;
  };

  type ElementType = {
    #wall;
    #column;
    #beam;
    #floor;
    #door;
    #window;
    #duct;
    #pipe;
  };

  type Discipline = {
    #architecture;
    #structure;
    #mep;
    #partsAssemblies;
  };

  type Comment = {
    id : Nat;
    elementId : Nat;
    author : Text;
    text : Text;
    resolved : Bool;
    createdAt : Int;
  };

  module Comment {
    public func compare(c1 : Comment, c2 : Comment) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  type Snapshot = {
    id : Nat;
    projectId : Nat;
    name : Text;
    description : Text;
    createdAt : Int;
  };

  module Snapshot {
    public func compare(s1 : Snapshot, s2 : Snapshot) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  type Clash = {
    id : Nat;
    projectId : Nat;
    element1Id : Nat;
    element2Id : Nat;
    clashType : ClashType;
    severity : ClashSeverity;
    resolved : Bool;
  };

  module Clash {
    public func compare(c1 : Clash, c2 : Clash) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  type ClashType = {
    #hard;
    #soft;
    #workflow;
  };

  type ClashSeverity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  type AnalysisResult = {
    id : Nat;
    elementId : Nat;
    utilizationRatio : Float;
    governingCheck : Text;
    status : AnalysisStatus;
  };

  module AnalysisResult {
    public func compare(a1 : AnalysisResult, a2 : AnalysisResult) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  type AnalysisStatus = {
    #pass;
    #warning;
    #fail;
  };

  ///////////////////
  // State
  //////////////////
  let projectIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let elementIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let commentIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let snapshotIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let clashIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let analysisIdCounter = Map.singleton<Nat, Nat>(0, 0);

  let projects = Map.empty<Nat, Project>();
  let elements = Map.empty<Nat, Element>();
  let comments = Map.empty<Nat, Comment>();
  let snapshots = Map.empty<Nat, Snapshot>();
  let clashes = Map.empty<Nat, Clash>();
  let analyses = Map.empty<Nat, AnalysisResult>();

  // Authorization component state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  ///////////////////
  // User Profile Management
  //////////////////
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  ///////////////////
  // Project Management
  //////////////////
  public shared ({ caller }) func createProject(name : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let newId = switch (projectIdCounter.get(0)) {
      case (null) { Runtime.trap("Project ID counter missing") };
      case (?id) { id + 1 };
    };

    projectIdCounter.add(0, newId);

    let project : Project = {
      id = newId;
      name;
      description;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    projects.add(newId, project);
    newId;
  };

  public query ({ caller }) func getProject(projectId : Nat) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) { project };
    };
  };

  public shared ({ caller }) func updateProject(projectId : Nat, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    let project = switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?p) { p };
    };

    let updatedProject : Project = {
      id = project.id;
      name;
      description;
      createdAt = project.createdAt;
      updatedAt = Time.now();
    };

    projects.add(projectId, updatedProject);
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    projects.values().toArray().sort();
  };

  ///////////////////
  // Element Management
  //////////////////
  public shared ({ caller }) func createElement(
    projectId : Nat,
    elementType : ElementType,
    discipline : Discipline,
    properties : Text,
    position : Position,
    dimensions : Dimensions,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create elements");
    };

    let newId = switch (elementIdCounter.get(0)) {
      case (null) { Runtime.trap("Element ID counter missing") };
      case (?id) { id + 1 };
    };

    elementIdCounter.add(0, newId);

    let element : Element = {
      id = newId;
      projectId;
      elementType;
      discipline;
      properties;
      position;
      dimensions;
    };

    elements.add(newId, element);
    newId;
  };

  public query ({ caller }) func getElement(elementId : Nat) : async Element {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view elements");
    };

    switch (elements.get(elementId)) {
      case (null) { Runtime.trap("Element does not exist") };
      case (?element) { element };
    };
  };

  public query ({ caller }) func getAllElementsByProject(projectId : Nat) : async [Element] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view elements");
    };

    elements.values().toArray().filter(func(e) { e.projectId == projectId }).sort();
  };

  ///////////////////
  // Comment Management
  //////////////////
  public shared ({ caller }) func addComment(elementId : Nat, author : Text, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let newId = switch (commentIdCounter.get(0)) {
      case (null) { Runtime.trap("Comment ID counter missing") };
      case (?id) { id + 1 };
    };

    commentIdCounter.add(0, newId);

    let comment : Comment = {
      id = newId;
      elementId;
      author;
      text;
      resolved = false;
      createdAt = Time.now();
    };

    comments.add(newId, comment);
    newId;
  };

  public shared ({ caller }) func resolveComment(commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve comments");
    };

    let comment = switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment does not exist") };
      case (?c) { c };
    };

    comments.add(
      commentId,
      { id = comment.id; elementId = comment.elementId; author = comment.author; text = comment.text; resolved = true; createdAt = comment.createdAt },
    );
  };

  public query ({ caller }) func getCommentsByElement(elementId : Nat) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    comments.values().toArray().filter(func(c) { c.elementId == elementId }).sort();
  };

  ///////////////////
  // Snapshot Management
  //////////////////
  public shared ({ caller }) func createSnapshot(
    projectId : Nat,
    name : Text,
    description : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create snapshots");
    };

    let newId = switch (snapshotIdCounter.get(0)) {
      case (null) { Runtime.trap("Snapshot ID counter missing") };
      case (?id) { id + 1 };
    };

    snapshotIdCounter.add(0, newId);

    let snapshot : Snapshot = {
      id = newId;
      projectId;
      name;
      description;
      createdAt = Time.now();
    };

    snapshots.add(newId, snapshot);
    newId;
  };

  public query ({ caller }) func getSnapshotsByProject(projectId : Nat) : async [Snapshot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view snapshots");
    };

    snapshots.values().toArray().filter(func(s) { s.projectId == projectId }).sort();
  };

  ///////////////////
  // Clash Management
  //////////////////
  public shared ({ caller }) func addClash(
    projectId : Nat,
    element1Id : Nat,
    element2Id : Nat,
    clashType : ClashType,
    severity : ClashSeverity,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add clashes");
    };

    let newId = switch (clashIdCounter.get(0)) {
      case (null) { Runtime.trap("Clash ID counter missing") };
      case (?id) { id + 1 };
    };

    clashIdCounter.add(0, newId);

    let clash : Clash = {
      id = newId;
      projectId;
      element1Id;
      element2Id;
      clashType;
      severity;
      resolved = false;
    };

    clashes.add(newId, clash);
    newId;
  };

  public shared ({ caller }) func resolveClash(clashId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resolve clashes");
    };

    let clash = switch (clashes.get(clashId)) {
      case (null) { Runtime.trap("Clash does not exist") };
      case (?c) { c };
    };

    clashes.add(
      clashId,
      { id = clash.id; projectId = clash.projectId; element1Id = clash.element1Id; element2Id = clash.element2Id; clashType = clash.clashType; severity = clash.severity; resolved = true },
    );
  };

  public query ({ caller }) func getClashesByProject(projectId : Nat) : async [Clash] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clashes");
    };

    clashes.values().toArray().filter(func(c) { c.projectId == projectId }).sort();
  };

  ///////////////////
  // Analysis Management
  //////////////////
  public shared ({ caller }) func addAnalysisResult(
    elementId : Nat,
    utilizationRatio : Float,
    governingCheck : Text,
    status : AnalysisStatus,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add analysis results");
    };

    let newId = switch (analysisIdCounter.get(0)) {
      case (null) { Runtime.trap("Analysis ID counter missing") };
      case (?id) { id + 1 };
    };

    analysisIdCounter.add(0, newId);

    let analysis : AnalysisResult = {
      id = newId;
      elementId;
      utilizationRatio;
      governingCheck;
      status;
    };

    analyses.add(newId, analysis);
    newId;
  };

  public query ({ caller }) func getAnalysesByElement(elementId : Nat) : async [AnalysisResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analysis results");
    };

    analyses.values().toArray().filter(func(a) { a.elementId == elementId }).sort();
  };
};
