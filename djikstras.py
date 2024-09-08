import heapq
import matplotlib.pyplot as plt
import networkx as nx
from tabulate import tabulate  # To format the distance table

# Custom Dijkstra's Algorithm with step-by-step output
def dijkstra_with_steps(graph, start):
    # Priority queue to store (distance, node) and visited set
    queue = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    visited = set()
    
    # Step-by-step process
    steps = []
    
    while queue:
        current_distance, current_node = heapq.heappop(queue)
        
        if current_node in visited:
            continue
        
        visited.add(current_node)
        
        # Record the step
        steps.append((current_node, distances.copy()))
        
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(queue, (distance, neighbor))
    
    return distances, steps

# Example graph represented as an adjacency list (dictionary)
graph = {
    1: {2: 1, 3: 4},
    2: {1: 1, 3: 2, 4: 5},
    3: {1: 4, 2: 2, 5: 1},
    4: {2: 5, 5: 3},
    5: {3: 1, 4: 3}
}

# Running Dijkstra's algorithm from node 1 with step tracking
start_node = 1
distances, steps = dijkstra_with_steps(graph, start_node)

# Print the steps of the algorithm
print("Steps of Dijkstra's Algorithm:")
for step_num, (node, dist) in enumerate(steps, 1):
    print(f"\nStep {step_num}: Processing node {node}")
    print(tabulate([(k, v) for k, v in dist.items()], headers=["Node", "Distance"]))

# Final shortest distances
print(f"\nShortest distances from node {start_node}:")
print(tabulate([(k, v) for k, v in distances.items()], headers=["Node", "Distance"]))

# Visualization using networkx and matplotlib
G = nx.Graph()

# Adding edges from the graph with weights
for node, neighbors in graph.items():
    for neighbor, weight in neighbors.items():
        G.add_edge(node, neighbor, weight=weight)

# Visualizing the graph
pos = nx.spring_layout(G)
nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=700, font_size=12, font_color='black')
nx.draw_networkx_edge_labels(G, pos, edge_labels={(u, v): d['weight'] for u, v, d in G.edges(data=True)})

# Highlight the shortest path from start_node to each other node
shortest_paths = nx.single_source_dijkstra_path(G, start_node)

for target, path in shortest_paths.items():
    if len(path) > 1:
        path_edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='r', width=2.5)

plt.title(f"Shortest Distances from Node {start_node}")
plt.show()
