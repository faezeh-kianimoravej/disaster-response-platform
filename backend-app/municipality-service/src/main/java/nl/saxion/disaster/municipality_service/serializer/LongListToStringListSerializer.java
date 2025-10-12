package nl.saxion.disaster.municipality_service.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.util.List;

public class LongListToStringListSerializer extends JsonSerializer<List<Long>> {

    @Override
    public void serialize(List<Long> value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartArray();
        if (value != null) {
            for (Long item : value) {
                gen.writeString(item != null ? item.toString() : null);
            }
        }
        gen.writeEndArray();
    }
}
