package nl.saxion.disaster.municipality_service.util;

import java.util.Base64;

public class H2Functions {

    public static byte[] base64ToBlob(String base64) {
        if (base64 == null) return null;
        return Base64.getDecoder().decode(base64);
    }
}
