# Service Discovery in Kubernetes

Service discovery in Kubernetes is the process of automatically detecting and connecting services within a Kubernetes cluster. It allows applications to find and communicate with each other without requiring manual configuration of IP addresses or ports.

## How Service Discovery Works

Kubernetes provides two primary mechanisms for service discovery:

### 1. **Environment Variables**
   - When a Pod is created, Kubernetes injects environment variables for all Services in the same namespace.
   - These variables include the Service's cluster IP and port.
   - Example:
     ```bash
     MY_SERVICE_SERVICE_HOST=10.96.0.1
     MY_SERVICE_SERVICE_PORT=80
     ```

### 2. **DNS-Based Service Discovery**
   - Kubernetes includes a built-in DNS server that automatically creates DNS records for Services.
   - Applications can use these DNS names to connect to Services.
   - Example:
     ```bash
     curl http://my-service.my-namespace.svc.cluster.local
     ```

## Types of Services

Kubernetes offers different types of Services for various use cases:

1. **ClusterIP** (default):
   - Exposes the Service within the cluster.
   - Accessible only from within the cluster.

2. **NodePort**:
   - Exposes the Service on a specific port of each Node.
   - Accessible from outside the cluster using `<NodeIP>:<NodePort>`.

3. **LoadBalancer**:
   - Provisions an external load balancer to expose the Service.
   - Requires integration with a cloud provider.

4. **ExternalName**:
   - Maps a Service to an external DNS name.

## Example: Creating a Service

Here’s an example of a Kubernetes Service manifest:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

- `selector`: Matches Pods with the label `app: my-app`.
