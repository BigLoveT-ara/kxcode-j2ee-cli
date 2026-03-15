package com.outbound.dtos;

import org.apache.commons.lang.StringUtils;

/**
 * Brain返回的List
 */
public class BrainResultDTO {

    private String key;

    private String value;

    private String type;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BrainResultDTO(String key, String value, String type) {
        this.key = key;
        this.value = value;
        this.type = type;
    }

    public BrainResultDTO(String key, String type) {
        this.key = key;
        this.type = type;
    }


    public static BrainResultDTO buildStringDTO(String key) {
        return new BrainResultDTO(key, StringUtils.EMPTY, STRING_TYPE);
    }

    public static BrainResultDTO buildStringDTO(String key, String value) {
        return new BrainResultDTO(key, value, STRING_TYPE);
    }

    public static BrainResultDTO buildIntegerDTO(String key) {
        return new BrainResultDTO(key, INTEGER_TYPE);
    }

    public static BrainResultDTO buildIntegerDTO(String key, String value) {
        return new BrainResultDTO(key, value, INTEGER_TYPE);
    }

    public static BrainResultDTO buildIntegerDTO(String key, Integer value) {
        return new BrainResultDTO(key, String.valueOf(value), INTEGER_TYPE);
    }

    public static final String STRING_TYPE = "String";

    public static final String INTEGER_TYPE = "Integer";
}
