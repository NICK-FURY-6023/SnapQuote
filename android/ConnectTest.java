import java.net.URL;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;

class ConnectTest {
    public static void main(String[] args) throws Exception {
        String urlString = args.length > 0 ? args[0] : "https://repo1.maven.org/maven2/";
        URL url = new URL(urlString);
        String host = url.getHost();

        System.out.println("Host: " + host);
        System.out.println("Protocol: " + url.getProtocol());
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("OS: " + System.getProperty("os.name") + " " + System.getProperty("os.version"));
        System.out.println("preferIPv4Stack: " + System.getProperty("java.net.preferIPv4Stack"));
        System.out.println("preferIPv6Addresses: " + System.getProperty("java.net.preferIPv6Addresses"));

        // DNS resolution
        System.out.println("\n=== DNS Resolution ===");
        InetAddress[] addrs = InetAddress.getAllByName(host);
        for (InetAddress addr : addrs) {
            System.out.println("  " + addr.getHostAddress() + " (" + addr.getClass().getSimpleName() + ")");
        }

        // Raw TCP connect test - try each resolved address
        System.out.println("\n=== Raw TCP Connect ===");
        int port = url.getPort() > 0 ? url.getPort() : (url.getProtocol().equals("https") ? 443 : 80);
        for (InetAddress addr : addrs) {
            try {
                Socket s = new Socket();
                s.connect(new InetSocketAddress(addr, port), 5000);
                System.out.println("  " + addr.getHostAddress() + ":" + port + " - CONNECTED");
                s.close();
            } catch (Exception e) {
                System.out.println("  " + addr.getHostAddress() + ":" + port + " - FAILED: " + e.getMessage());
            }
        }

        // Full HTTP connect
        System.out.println("\n=== Full HTTP Connect ===");
        try {
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(5000);
            conn.connect();
            System.out.println("CONNECTED: " + conn.getResponseCode() + " " + conn.getResponseMessage());
            conn.disconnect();
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getClass().getName() + ": " + e.getMessage());
        }
    }
}
